import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ReactPlayer from "react-player";
import styled from "styled-components";
import { getArticlesAPI, removeCommentAPI, updateArticleAPI } from "../action";
import PostalModal from "./PostalModal";
import { useNavigate } from 'react-router-dom';
import { handleDeleteArticle, handleSaveArticle } from "./SaveItem";
import { arrayUnion, deleteDoc, doc, updateDoc } from "firebase/firestore";
import db from "../firebase.config";
import ProfileReminder from "./ProfileReminder";


// const Container = styled.div`
// 	grid-area: main;
// `;

const CommonBox = styled.div`
	text-align: center;
	overflow: hidden;
	margin-bottom: 8px;
	background-color: #fff;
	border-radius: 5px;
	position: relative;
	border: none;
	box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
`;

const ShareBox = styled(CommonBox)`
	display: flex;
	border-radius : 1.5rem;
	flex-direction: column;
	margin: 0 0 8px;
	color: #958b7b;  
	
	div {
		button {
			outline: none;
			${'' /* color: rgba(0, 0, 0, 0.6); */}
			font-size: 14px;
			line-height: 1.5;
			min-height: 48px;
			display: flex;
			align-items: center;
			border: none;
			background-color: transparent;
			font-weight: 600;
		}
		&:first-child {
			display: flex;
			align-items: center;
			padding: 8px 16px;
			img {
				width: 48px;
				border-radius: 50%;
				margin-right: 8px;
			}
			button {
				margin: 4px 0;
				flex-grow: 1;
				padding-left: 16px;
				border: 1px solid rgba(0, 0, 0, 0.15);
				border-radius: 35px;
				text-align: left;
			}
		}
		&:nth-child(2) {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			padding-bottom: 4px;
			button {
				img {
					margin: 0 4px 0 -2px;
				}
			}
		}
	}
`;

const Article = styled(CommonBox)`
	padding: 0;
	margin: 0 0 8px;
	overflow: visible; 
	background-color : white ;
	border-radius: 1rem;
`;

const SharedActor = styled.div`
	padding-right: 40px;
	flex-wrap: nowrap;
	padding: 12px 16px 0;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	a {
		margin-right: 12px;
		flex-grow: 1;
		overflow: hidden;
		display: flex;
		img {
			width: 48px;
			height: 48px;
			border-radius: 50%;
		}
		& > div {
			display: flex;
			flex-direction: column;
			flex-grow: 1;
			flex-basis: 0;
			margin-left: 8px;
			overflow: hidden;
			span {
				text-align: left;
				&:first-child {
					font-size: 14px;
					font-weight: 700;
					color: #000;
				}
				&:nth-child(n + 2) {
					font-size: 12px;
					color: rgba(0, 0, 0, 0.6);
				}
			}
		}
	}
	button {
		position: absolute;
		top: 0;
		right: 12px;
		border: none;
		outline: none;
		background: transparent;
	}
`;

const Description = styled.div`
	padding: 0 16px;
	overflow: hidden;
	font-size: 14px;
	text-align: left;
`;

const SharedImage = styled.div`
	margin: 8px 16px 0;
	background-color: #f9fafb;
	img {
		width: 100%;
		height: 100%;
	}
`;

const SocialCount = styled.ul`
	line-height: 1.3;
	display: flex;
	align-items: flex-start;
	overflow: auto;
	margin: 0 16px;
	padding: 8px 0;
	border-bottom: 1px solid #e9efdf;
	color: rgba(0, 0, 0, 0.6);
	list-style: none;
	li {
		margin-right: 5px;
		font-size: 12px;
		button {
			display: flex;
			border: none;
			color: rgba(0, 0, 0, 0.6);
			background: transparent;
			span {
				padding-left: 5px;
			}
		}
	}
`;

const SocialActions = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start; 
	background-color : #79aad7 !important;
	border : 1px solid white;
	border-bottom-left-radius : 12px ;
	border-bottom-right-radius : 12px ;
	margin :-1px 0px ;
	min-height: 40px;
	padding-bottom: 5px;
	button {
		display: inline-flex;
		align-items: center;
		padding: 8px;
		border: none;
		background: transparent;
		span {
			margin-left: 4px;
			color: rgba(0, 0, 0, 0.6);
			font-size: 14px;
		}
	}
	button.active {
		span {
			color: #0a66c2;
			font-weight: 600;
		}
		svg {
			fill: #0a66c2;
		}
	}
`;

const Content = styled.div`
	text-align: center;
	& > img {
		width: 30px;
	}
`;

const CommentSection = styled.div`
	${'' /* margin: 10px 0; */}
	text-align: left;
	display: flex; 
    flex-direction: column; 
    ${'' /* margin: 0rem 1rem; */}
    ${'' /* text-align: start; */} 
`;

const CommentInput = styled.input`
	width: 80%;
	padding: 8px;
	margin-top: 5px; 
	border: 1px solid #ccc;
	border-radius: 4px;
`;

function Main(props) {
	const [comments, setComments] = useState({}); 
	const navigate = useNavigate(); 
	const [showModal, setShowModal] = useState("close");
	const [savedArticles,setSavedArticles] = useState({})
	const [visibleDeleteId, setVisibleDeleteId] = useState(null);
	const currentUser = useSelector(state=>state.userState.user) 

	const clickHandler = (event) => {
		event?.preventDefault();
		if (event.target !== event.currentTarget) {
			return;
		}
		switch (showModal) {
			case "open":
				setShowModal("close");
				break;
			case "close":
				setShowModal("open");
				break;
			default:
				setShowModal("close");
				break;
		}
	};

	const closeModal = () => {
		setShowModal("close");
	};
	

  const redirectToProfile = (actor) => { 
	console.log(actor)
    navigate(`/profile/${actor?.description}`,{state : { image: actor?.image }}); 
  };

	useEffect(() => {
		props.getArticles();  
	}, [props.articles?.length]);


async function likeHandler(event, postIndex, postId) {
  event.preventDefault();
  let currentLikes = props.articles[postIndex].likes.count;
  let whoLiked = props.articles[postIndex].likes.whoLiked;
  let user = props.user?.email || "";
  let userWhoLikedName = props.user?.name || "Someone"; // Use user's display name or "Someone" if not available
  let userIndex = Array.isArray(whoLiked) ? whoLiked.indexOf(user) : -1;
  let postOwnerEmail = props.articles[postIndex].actor.description; // Assuming the article has an "actor" property with the email
  console.log(postOwnerEmail , userWhoLikedName)
  // Determine if the user is liking or unliking the post
  if (userIndex >= 0) {
    // User is unliking the post
    currentLikes--;
    whoLiked.splice(userIndex, 1);
  } else if (userIndex === -1) {
    // User is liking the post
    currentLikes++;
    whoLiked.push(user);

    // Send notification to the article poster if liking the post
    if (postOwnerEmail !== user) {
      const notificationMessage = `${userWhoLikedName} liked your post`;

      // Create a notification object
      const notification = {
        content: notificationMessage,
        id: new Date().getTime().toString(),
        read: false,
        timestamp: new Date(),
        type: "like",
      };
	  console.log(notification);

      try {
        // Update the article poster's notifications in Firebase
        const userRef = doc(db, "profiles", postOwnerEmail); // Assuming "users" is the collection name
        await updateDoc(userRef, {
          notifications: arrayUnion(notification) // Add the new notification to the user's notifications array
        });
        console.log("Notification sent successfully!");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  }

  // Update the likes count and whoLiked list in the local state
  const payload = {
    update: {
      likes: {
        count: currentLikes,
        whoLiked: whoLiked,
      },
    },
    id: postId,
  };

  // Call the parent component's likeHandler to update the article in the state
  props.likeHandler(payload);
}


	const handleCommentToggle = (key) => {
		setComments((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				showInput: !prev[key]?.showInput,
			},
		}));
	};



const handleCommentSubmit = async (event, key, postId) => {
  event.preventDefault();
  const commentText = comments[key]?.inputValue || '';
  if (commentText) {
    const newComment = {
      text: commentText,
      user: props.user.name,
      photo: props.user?.photoURL || '/images/user.svg', // Default photo if not available
      date: new Date(),
    };

    // Update the local comments state
    setComments((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        comments: [...(prev[key]?.comments || []), newComment],
        inputValue: '',
        showInput: false,
      },
    }));

    const payload = {
      update: {
        comments: [
          ...(props.articles[key].comments || []),
          newComment,
        ],
      },
      id: postId,
    };

    // Call the parent component's handler to update the comments in the state
    props.likeHandler(payload);

    // Send a notification to the article poster if the commenter is not the post owner
    const postOwnerEmail = props.articles[key].actor.description; // Assuming the article has an "actor" property with the email
    const commenterName = props.user?.name || 'Someone';

    if (postOwnerEmail !== props.user?.email) {
      const notificationMessage = `${commenterName} commented on your post`;

      // Create a notification object
      const notification = {
        content: notificationMessage,
        id:new Date().getTime().toString(),
        read: false,
        timestamp: new Date(),
        type: "comment",
      };
      console.log(commenterName , postOwnerEmail , notification)
      try {
        // Update the article poster's notifications in Firebase
        const userRef = doc(db, "profiles", postOwnerEmail); // Assuming "users" is the collection name
        await updateDoc(userRef, {
          notifications: arrayUnion(notification) // Add the new notification to the user's notifications array
        });
        console.log("Notification for comment sent successfully!");
      } catch (error) {
        console.error("Error sending comment notification:", error);
      }
    }
  }
};


	const handleCommentChange = (key, value) => {
		setComments((prev) => ({
			...prev,
			[key]: {
				...prev[key],
				inputValue: value,
			},
		}));
	};
	const dispatch = useDispatch()

	const handleDeleteComment = (articleId, comment) => {
		console.log(articleId.id , comment);
		console.log("Comment User: ", comment.user, "Logged-in User: ", props.user.name);		
		if (comment.user === props?.user?.name) {
			dispatch(removeCommentAPI(articleId.id, comment))
			.then(() => {
				console.log("Comment deleted successfully");
				// Optionally refresh articles
				// props.getArticles(); // Fetch the updated list
			})
			.catch((error) => console.error("Error deleting comment:", error));
			console.log("Comment is being deleted...");
		} else {
			alert("You can only delete your own comments.");
			console.log("Alert triggered - User mismatch.");
		}
	};

	const handleToggleSave = async (article) => {
		const articleId = article.id;
		console.log(articleId)
		const isCurrentlySaved = savedArticles[articleId] || false;
	  
		if (isCurrentlySaved) {
		  // Unsave the article
		  await handleDeleteArticle(article);
		  console.log("Article deleted from saved list");
		} else {
		  // Save the article
		  await handleSaveArticle(article);
		  console.log("Article saved to saved list");
		}
	  
		// Update the savedArticles state and local storage to reflect the current status
		setSavedArticles((prevSavedArticles) => {
		  const updatedSavedArticles = {
			...prevSavedArticles,
			[articleId]: !isCurrentlySaved,
		  };
	  
		  // Save the updated state to local storage
		  localStorage.setItem("savedArticles", JSON.stringify(updatedSavedArticles));
		  return updatedSavedArticles;
		});
	  };
	  
	  // When the component loads, initialize the savedArticles state from local storage
	  useEffect(() => {
		const saved = JSON.parse(localStorage.getItem("savedArticles")) || {};
		setSavedArticles(saved);
	  }, []);

	  const handleDeletePost = async (articleId) => {
		console.log(articleId);
		try {
		  // Delete the article from Firebase Firestore
		  const articleRef = doc(db, "articles", articleId); // Assuming "articles" is the collection name
		  await deleteDoc(articleRef);
	  
		  console.log("Article deleted successfully!");
		} catch (error) {
		  console.error("Error deleting article:", error);
		  alert("Failed to delete the article. Please try again.");
		}
	  };

	  const toggleDelete = (id) => {
		setVisibleDeleteId(visibleDeleteId === id ? null : id);
	  };
	  

	const formatTimestamp = (timestamp) => {
		const date = new Date(timestamp.seconds * 1000);
		return date.toLocaleString();
	  };
		
	return (
		<Content>
		<ProfileReminder user={props.user} />
		<PostalModal showModal={showModal} clickHandler={clickHandler} closeModal={closeModal}/>
		<ShareBox className="effect">
				<div className="col-12">
					{props?.user?.photoURL ? <img src={props?.user?.photoURL} alt="" /> : <img className="col-2" src="/images/user.svg" alt="" />}
					<button className="bg-white col-12 col-10" onClick={clickHandler} disabled={props.loading ? true : false}>
						Start a post
					</button>
				</div>
				<div>
					<button onClick={clickHandler}>
						{/* <img src="/images/photo-icon.svg" alt="" /> */}
						<i className="bi bi-card-image fs-5 text-white mx-1"></i>
						<span>Photo</span>
					</button>
					<button onClick={clickHandler}>
						{/* <img src="/images/video-icon.svg" alt="" /> */}
						<i className="bi bi-play-btn-fill fs-5 text-danger mx-1"></i>
						<span>Video</span>
					</button>
					<button onClick={clickHandler}>
						{/* <img src="/images/event-icon.svg" alt="" /> */}
						<i className="bi bi-calendar2-date fs-5 text-success mx-2"></i>
						<span>Event</span>
					</button>
					<button onClick={clickHandler}>
						{/* <img src="/images/article-icon.svg" alt="" /> */}
						<i className="bi bi-card-list fs-5 text-warning mx-2"></i>
						<span>Write article</span>
					</button>
				</div>
			</ShareBox>
  {props.loading && <img src="/images/spin-loader.gif" alt="" />}
  {props.articles.length > 0 &&
    props.articles.map((article, key) => (
      <Article key={key} id={`article-${article.id}`} className=" ">
        <SharedActor style={{ cursor: 'pointer' }}>
          <a  onClick={() => redirectToProfile(article?.actor)}>
            <img src={article.actor?.image || '/images/user.svg'} alt="" />
            <div>
              <span>{article.actor.title}</span>
              <span>{article.actor.description}</span>
              {/* Display the formatted date */}
              {article.actor && (
                <p className="small text-muted text-start mt-0">
                  {formatTimestamp(article.actor.date)}
                </p>
              )}
            </div>
          </a>
		  <span onClick={() => toggleDelete(article.id)} className="float-end dots" hidden={currentUser?.email === article.actor.description ? false :true}><i   className="bi bi-three-dots-vertical  mt-2"></i></span>{visibleDeleteId === article.id && (
        <button
          onClick={() => handleDeletePost(article.id)}
          className="small del rounded btn-outline-danger fw-semibold"
        >
          Delete post
        </button>
      )}
          {/* <button>
            <img src="/images/ellipsis.svg" alt="" />
          </button> */}
        </SharedActor>
        <Description>{article.description}</Description>
        <SharedImage>
          {article.sharedImg && <img src={article.sharedImg} alt="" />}
          {article.video && <ReactPlayer width="100%" url={article.video} />}
        </SharedImage>
        <SocialCount>
          <li>
            <button>
              <img src="/images/like-icon.svg" alt="" height={'15px'} />
              <span>{article.likes.count}</span>
            </button>
          </li>
          <li>
            <button>
              <img src="/images/comment-icon.svg" alt="" height={'15px'} />
              <span>{article.comments.length}</span>
            </button>
          </li>
        </SocialCount>
        <SocialActions className="d-flex justify-content-evenly">
          <button
            onClick={(event) => likeHandler(event, key, props.ids[key])}
            className={article.likes.whoLiked.includes(props.user?.email) ? 'active' : ''}
          >
            <img src="/images/like-icon.svg" alt="" />
            <span>Like</span>
          </button>
          <button onClick={() => handleCommentToggle(key)}>
            <img src="/images/comment-icon.svg" alt="" />
            <span>Comment</span>
          </button>
		  <button onClick={()=>handleToggleSave(article)}>
            {/* <img height={'18px'} src="/images/save-16.jpg" alt=""/> */}
			<i className="bi bi-save text-dark fs-5"></i>
            <span>{savedArticles[article.id] ? 'Unsave' : 'Save'}</span>
          </button>
        </SocialActions>
        <CommentSection>
          {/* Render existing comments */}
          {(article.comments || []).map((comment, index) => (
            <div className="p-3"
              key={index}
               
            >
              <div className="d-flex">
                {comment?.photo && (
                  <img
                    src={comment?.photo}
                    alt=""
                    height={'20px'}
                    width={'20px'}
                    style={{
                      marginRight: '8px',
                      borderRadius: '50%',
                      paddingBottom: '0',
                    }}
                  />
                )}
				<span className="d-flex flex-column">
                <span className="fw-semibold">{comment.user}</span><span className=" text-muted" style={{fontSize : '12px'}}>{formatTimestamp(comment?.date)}</span></span>
              </div>
			  <span className="d-flex justify-content-between align-items-center">
                <p className="mx-4 pl-1 small fw-normal">
                  {comment.text}
                </p>
              {comment?.user === props?.user?.name && (
                <button
                  style={{ background: 'none', border: 'none' }}
                  onClick={() => {
                    handleDeleteComment(article, comment);
                  }}
                >
                  <i className="bi bi-trash3-fill text-danger"></i>
                </button>
              )}
			  </span>
            </div>
          ))}

          {/* Comment input */}
          {comments[key]?.showInput && (
            <div className="text-center col-12">
			<span className="d-flex align-items-center my-2">
				<img height={'40px'} className="rounded mx-1" src={currentUser?.image || '/images/user.svg'} alt="" />
              <CommentInput 
                type="text" 
                placeholder="Add a comment..."
                value={comments[key]?.inputValue || ''}
                onChange={(e) => handleCommentChange(key, e.target.value)}
              />
			</span>
			
              <button
                className="border-0 my-2 col-4 float-end mx-5 p-1 btn btn-primary w-25"
                onClick={(e) => handleCommentSubmit(e, key, props.ids[key])}
              >
                Submit
              </button>
            </div>
          )}
        </CommentSection>
      </Article>
    ))}
</Content>

	);
}

const mapStateToProps = (state) => {
	return {
		user: state.userState.user,
		loading: state.articleState.loading,
		articles: state.articleState.articles,
		ids: state.articleState.ids,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getArticles: () => dispatch(getArticlesAPI()),
	likeHandler: (payload) => dispatch(updateArticleAPI(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
