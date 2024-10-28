import db, { auth, provider, storage } from "../firebase";
import { SET_LOADING_STATUS, SET_USER, GET_ARTICLES } from "./actionType";
import { collection, addDoc, updateDoc, arrayRemove } from "firebase/firestore"; // Import arrayRemove
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from "firebase/storage";
import { query, orderBy, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"; 
import { getFirestore, doc , getDoc } from 'firebase/firestore'; 


// Redux action to set user and profile data
export const setUser = (userData) => ({
	type: SET_USER,
	user: userData,
  });
  
  export const fetchIndividualFromFirestore = async (email) => {
    try {
        const userDocRef = doc(db, "profiles", email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data(); // Return the profile data
        } else {
            console.log("No profile found for this email.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
};
  
  // Fetch profile data from Firestore
  export const fetchUserProfile = () => async (dispatch) => {
	const auth = getAuth();
	const db = getFirestore();

	onAuthStateChanged(auth, async (user) => {
		if (user) {
			console.log('User is logged in:', user); // Check if this logs the user details
			const userEmail = user.email;
			const userDocRef = doc(db, 'profiles', userEmail);
			try {
				const userProfile = await getDoc(userDocRef);
				if (userProfile.exists()) {
					const profileData = userProfile.data();

					const userData = {
						name: user.name,
						email: user.email,
						photoURL: user.photoURL,
						...profileData,
					};

					dispatch(setUser(userData));
				} else {
					console.log('No profile found for this user in Firestore');
				}
			} catch (error) {
				console.error('Error fetching user profile:', error);
			}
		} else {
			console.log('No user is logged in');
		}
	});
};

export function setLoading(status) {
	return {
		type: SET_LOADING_STATUS,
		status: status,
	};
}

export function getArticles(payload, id) {
	return {
		type: GET_ARTICLES,
		payload: payload,
		id: id,
	};
}

export function getUserAuth() {
	return (dispatch) => {
		auth.onAuthStateChanged(async (user) => {
			if (user) {
				dispatch(setUser(user));
			}
		});
	};
}

export function signInAPI() {
	return (dispatch) => {
		signInWithPopup(auth, provider)
			.then((result) => dispatch(setUser(result.user)))
			.catch((err) => alert(err.message));
	};
}

export function signOutAPI() {
	return (dispatch) => {
		signOut(auth)
			.then(() => dispatch(setUser(null)))
			.catch((err) => alert(err.message));
		};
		
}

export  function  postArticleAPI(payload) {
    console.log('Posting article with payload:', payload);

    return async(dispatch) => {
        dispatch(setLoading(true)); // Start loading

        // Check if the payload image is defined and not empty
        if (payload.image) {
            const storageRef = ref(storage, `images/${payload.image.name}`);
            const uploadTask = uploadBytesResumable(storageRef, payload.image);

            // Handle upload state changes
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done'); // Log progress if needed
                },
                (err) => {
                    console.error('Error during image upload:', err);
                    alert(err.message);
                    dispatch(setLoading(false)); // Stop loading on error
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        // Ensure all fields are defined before proceeding
                        if (!payload.user || !payload.user.email) {
                            throw new Error('User email is undefined.');
                        }

                        await addDoc(collection(db, "articles"), {
                            actor: {
                                description: payload.user.email,
                                title: payload.user.name,
                                date: payload.timestamp,
                                image: payload.user.photoURL,
                            },
                            video: payload.video || "",
                            sharedImg: downloadURL,
                            likes: {
                                count: 0,
                                whoLiked: [],
                            },
                            comments: [],
                            description: payload.description,
                        });

                        console.log('Article posted successfully');
                    } catch (error) {
                        console.error('Error posting article:', error);
                    } finally {
                        dispatch(setLoading(false)); // Stop loading after posting
                    }
                }
            );
        } else {
            // Handle case where there's no image
            try {
                if (!payload.user || !payload.user.email) {
                    throw new Error('User email is undefined.');
                }

                await addDoc(collection(db, "articles"), {
                    actor: {
                        description: payload.user.email,
                        title: payload.user.name,
                        date: payload.timestamp,
                        image: payload.user.photoURL,
                    },
                    video: payload.video || "",
                    sharedImg: "",
                    likes: {
                        count: 0,
                        whoLiked: [],
                    },
                    comments: [],
                    description: payload.description,
                });

                console.log('Article posted successfully');
            } catch (error) {
                console.error('Error posting article:', error);
            } finally {
                dispatch(setLoading(false)); // Stop loading after posting
            }
        }
    };
}


export function getArticlesAPI() {
    return (dispatch) => {
        dispatch(setLoading(true));
        const q = query(collection(db, "articles"), orderBy("actor.date", "desc"));

        onSnapshot(q, (snapshot) => {
            const payload = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const id = snapshot.docs.map((doc) => doc.id);
            dispatch(getArticles(payload, id));
            dispatch(setLoading(false));
        });
    };
}



export function updateArticleAPI(payload) {
	return (dispatch) => {
		const articleDoc = doc(db, "articles", payload.id);
		updateDoc(articleDoc, payload.update);
	};
}

// New function to remove a comment
export function removeCommentAPI(articleId, comment) {
    console.log(articleId , comment);
    return async (dispatch) => { // Return a function
        const articleDoc = doc(db, "articles", articleId);
        const commentToRemove = {
            date: comment.date,
			photo:comment.photo,
            text: comment.text,
            user: comment.user,
        };
        try {
			
            await updateDoc(articleDoc, {
                comments: arrayRemove(commentToRemove),
            });
            console.log("Comment deleted successfully.");
            dispatch(getArticlesAPI()); // Refresh articles after deletion
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };
}

export const uploadImage = async (file) => {
    const storageRef = ref(storage); // Get a reference to the storage
    const imageRef = ref(storageRef, `images/${file.name}`); // Create a reference for the file

    // Upload the file
    await uploadBytes(imageRef, file);

    // Get the download URL after the upload
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL; // Return the download URL
};