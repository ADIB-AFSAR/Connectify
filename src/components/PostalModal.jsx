import { useState } from "react";
import ReactPlayer from "react-player";
import { connect } from "react-redux";
import { arrayUnion, collection, doc, getDocs, Timestamp, updateDoc } from "firebase/firestore"; // Import Firestore and Timestamp
import styled from "styled-components";
import { postArticleAPI } from "../action";  
import db from "../firebase.config";


// Styled components remain unchanged
const Container = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;
  background-color: rgba(0, 0, 0, 0.8);
  animation: fadeIn 0.3s ease;
`;

const Content = styled.div`
  width: 100%;
  max-width: 552px;
  max-height: 90%;
  background-color: #fff;
  overflow: initial;
  border-radius: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  top: 32px;
  margin: 0 auto; 
  background-color: #79aaad
`;

const Header = styled.div`
  display: block;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 20px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    font-weight: 400;
  }
  button {
    width: 40px;
    height: 40px;
    min-width: auto;
    border: none;
    outline: none;
    background: transparent;
    img,
    svg {
      pointer-events: none;
    }
  }
`;

const SharedContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  vertical-align: baseline;
  background: transparent;
  padding: 5px 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 24px;
  img {
    width: 48px;
    height: 48px;
    background-clip: content-box;
    border-radius: 50%;
    border: 2px solid transparent;
  }
  span {
    font-weight: 600;
    font-size: 16px;
    line-height: 1.5;
    margin-left: 5px;
  }
`;

const ShareCreation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 24px 10px 16px;
`;

const AttachAsset = styled.div`
  display: flex;
  align-items: center;
`;

const AssetButton = styled.button`
  display: flex;
  align-items: center;
  height: 40px;
  min-width: auto;
  margin-right: 8px;
  border-radius: 50%;
  border: none;
  outline: none;
  justify-content: center;
  background: transparent;
  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }
`;

// const ShareComment = styled.div`
//   padding-left: 8px;
//   margin-right: auto;
//   border-left: 1px solid rgba(0, 0, 0, 0.08);
//   ${AssetButton} {
//     border-radius: 50px;
//     padding: 5px 10px;
//     span {
//       font-size: 16px;
//       font-weight: 600;
//       color: rgba(0, 0, 0, 0.6);
//       padding: 0 5px;
//     }
//   }
// `;

const PostButton = styled.button`
  min-width: 60px;
  padding: 0 16px;
  border-radius: 20px;
  background: ${(props) => (props.disabled ? "#b8b8b8" : "#0a66c2")};
  color: ${(props) => (props.disabled ? "#5a5a5a" : "#fff")};
  font-size: 16px;
  letter-spacing: 1.1px;
  border: none;
  outline: none;
  &:hover {
    background: ${(props) => (props.disabled ? "#b8b8b8" : "#004182")};
  }
`;

const Editor = styled.div`
  padding: 12px 24px;
  textarea {
    width: 100%;
    min-height: 100px;
    background-color : transparent;
    border: none;
    ${'' /* resize: none; */}
  }
  input {
    width: 100%;
    height: 35px;
    font-size: 16px;
    margin-bottom: 20px;
  }
`;

const UploadImage = styled.div`
  text-align: center;
  img {
    width: 100%;
  }
`;

function PostalModal(props) {
  const [editorText, setEditorText] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [videoFile, setVideoFile] = useState("");
  const [assetArea, setAssetArea] = useState("");

  const reset = (event) => {
    setEditorText("");
    setImageFile("");
    setVideoFile("");
    setAssetArea("");
    props.clickHandler(event);
  };

  function handleImage(event) {
    let image = event.target.files[0];
    if (image === "" || image === undefined) {
      alert(`Not an image. This file is: ${typeof imageFile}`);
      return;
    }
    setImageFile(image);
  }

  function switchAssetArea(area) {
    setImageFile("");
    setVideoFile("");
    setAssetArea(area);
  }

  const sendNotification = async (userEmail, description) => {
	const jobKeywords = ['job', 'internship', 'career', 'hiring', 'opening'];
	const hasJobKeywords = jobKeywords.some((keyword) => {
	  const regex = new RegExp(`\\b${keyword}\\b`, 'i');
	  return regex.test(description);
	});
  
	// Get all users from the database (except the one who posted the job)
	const usersSnapshot = await getDocs(collection(db, 'profiles'));
	const allUsers = usersSnapshot.docs.map((doc) => doc.data());
  
	// Get followers and following of the poster
	const posterFollowers = allUsers.find((user) => user.email === userEmail).connection.followers;
	const posterFollowing = allUsers.find((user) => user.email === userEmail).connection.following;
  
	// Create a set to store unique follower and following emails
	const targetUserEmails = new Set([...posterFollowers, ...posterFollowing]);
  
	// If the post is a job posting, send notifications to all users except the poster
	if (hasJobKeywords) {
	  const targetUsers = allUsers.filter((user) => user.email !== userEmail);
	  for (const targetUser   of targetUsers) {
		const targetUserRef = doc(db, 'profiles', targetUser.email);
		const notification = {
		  id: new Date().getTime().toString(),
		  type: 'job',
		  content: `${props.user.name || 'Someone'} has posted a new job.`,
		  timestamp: new Date(),
		  read: false,
		};
		await updateDoc(targetUserRef, {
		  notifications: arrayUnion(notification),
		});
	  }
	} else {
	  // If the post is not a job posting, send notifications to followers and following
	  for (const targetUserEmail of targetUserEmails) {
		const targetUser  = allUsers.find((user) => user.email === targetUserEmail);
		if (targetUser ) {
		  const targetUserRef = doc(db, 'profiles', targetUserEmail);
		  const notification = {
			id: new Date().getTime().toString(),
			type: 'regular',
			content: `Your connection ${props.user.name} has shared a new post.`,
			timestamp: new Date(),
			read: false,
		  };
		  await updateDoc(targetUserRef, {
			notifications: arrayUnion(notification),
		  });
		}
	  }
	}
  };

  const postArticle = async (event) => {
	event.preventDefault();
	if (event.target !== event.currentTarget) {
	  return;
	}
  
	const payload = {
	  image: imageFile,
	  video: videoFile,
	  description: editorText,
	  user: props.user,
	  timestamp: Timestamp.now(),
	};
  
	try {
	  // Post the article
	  await props.postArticle(payload);
  
	  // Attempt to send a notification
	  await sendNotification(props.user.email, editorText); // Pass the description for internal use, but not in notifications
  
	  // Reset the form
	  reset(event);
  
	  // Close the modal
	  props.closeModal();
  
	} catch (error) {
	  console.error("Error during postArticle:", error);
  
	  // Close the modal even if there was an error
	  props.closeModal();
	}
  }; 

  return (
    <>
      {props.showModal === "open" && (
        <Container>
          <Content>
            <Header>
              <h2>Create a post</h2>
              <button onClick={(event) => reset(event)}>
                <img src="/images/close-icon.svg" alt="" />
              </button>
            </Header>
            <SharedContent>
              <UserInfo>
                {props.user.photoURL ? <img src={props.user.photoURL} alt="" /> : <img src="/images/user.svg" alt="" />}
                <span>{props.user.name ? props.user.name : "Name"}</span>
              </UserInfo>
              <Editor>
                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="what do you want to talk about?"
                  autoFocus
                />
                {imageFile && (
                  <UploadImage>
                    <img src={URL.createObjectURL(imageFile)} alt="" />
                  </UploadImage>
                )}
                {videoFile && <ReactPlayer url={videoFile} />}
                {assetArea === "image" && (
                  <input type="file" accept="image/gif, image/jpeg, image/png" onChange={handleImage} />
                )}
                {assetArea === "video" && (
                  <input type="text " placeholder="Please enter a video link" onChange={(e) => setVideoFile(e.target.value)} />
                )}
              </Editor>
            </SharedContent>
            <ShareCreation>
              <AttachAsset>
                <AssetButton onClick={() => switchAssetArea("image")}>
                  {/* <img src="/images/photo-icon.svg" alt="Image" /> */}
                  <i className="bi bi-card-image fs-5 text-success"></i>
                </AssetButton>
                <AssetButton onClick={() => switchAssetArea("video")}>
                  {/* <img src="/images/video-icon.svg" alt="Video" /> */}
                  <i className="bi bi-play-btn-fill fs-5 text-danger"></i>
                </AssetButton>
              </AttachAsset>
              <PostButton disabled={!editorText} onClick={postArticle}>
                Post
              </PostButton>
            </ShareCreation>
          </Content>
        </Container>
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.userState.user,
  };
};

const mapDispatchToProps = (dispatch) => ({
  postArticle: (payload) => dispatch(postArticleAPI(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostalModal);