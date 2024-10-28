import React, { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import styled from "styled-components";
import { getArticles, getArticlesAPI, signOutAPI } from "../action";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebase.config";

const Container = styled.div`
	background-color: #fff;
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	padding: 0 24px;
	position: sticky;
	top: 0;
	left: 0;
	/* width: 100vw; */
	z-index: 10;  
`;

const Content = styled.div`
	display: flex;  
	align-items: center;
	margin: 0 auto;
	height: 100%;
	max-width: 1128px;
`;

const Logo = styled.span`
	margin-right: 8px;
	font-size: 0;
`;

const Search = styled.div`
    margin : 0rem 5rem ;
	opacity: 1;
	flex-grow: 1;
	position: relative;
	@media (max-width: 768px) {
		flex-grow: unset;
	}
	& > div {
		max-width: 280px;
		input {
			border: none;
			box-shadow: none;
			background-color: #eef3f8;
			border-radius: 2px;
			color: rgba(0, 0, 0, 0.9);
			width: 218px;
			padding: 0 8px 0 40px;
			line-height: 1.75;
			font-weight: 400;
			font-size: 14px;
			height: 34px;
			vertical-align: text-top;
			border-color: #dce6f1;
			@media (max-width: 768px) {
				width: 140px;
			}
		}
	}
`;

const SearchIcon = styled.div`
	width: 40px;
	z-index: 1;
	position: absolute;
	top: 10px;
	left: 5px;
	border-radius: 0 2px 2px 0;
	margin: 0;
	pointer-events: none;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Nav = styled.nav`
	margin-left: auto;
	display: block;
	@media (max-width: 768px) {
		position: fixed;
		left: 0;
		bottom: 0;
		background: white;
		width: 100%;
	}
`;

const NavListWrap = styled.ul`
	display: flex;
	flex-wrap: nowrap;
	list-style-type: none;
	justify-content: space-between;
	.active {
		span::after {
			content: "";
			transform: scaleX(1);
			border-bottom: 2px solid var(--white, #fff);
			position: absolute;
			left: 0;
			bottom: 0;
			transition: transform 0.2s ease-in-out;
			width: 100%;
			border-color: rgba(0, 0, 0, 0.9);
		}
	}
`;

const NavList = styled.li`
	display: flex;
	align-items: center;
	a {
		align-items: center;
		background: transparent;
		display: flex;
		flex-direction: column;
		font-size: 12px;
		font-weight: 400;
		justify-content: center;
		line-height: 1.5;
		min-height: 52px;
		min-width: 80px;
		position: relative;
		text-decoration: none;
		span {
			color: rgba(0, 0, 0, 0.6);
			display: flex;
			align-items: center;
			text-align: center;
		}
		@media (max-width: 768px) {
			min-width: 50px;
			font-size: 9px;
			span > img {
				width: 40%;
			}
		}
	}
	&:hover,
	&:active {
		a {
			span {
				color: rgba(0, 0, 0, 0.9);
			}
		}
	}
`;

const SignOut = styled.div`
	position: absolute;
	top: 45px;
	background: #cf4e59;  
	width: 100px;
	height: 40px;
	font-size: 16px;
	text-align: center;
	transition-duration: 167ms;
	display: none;
	z-index: 15;
`;

// const SignOutMobile = styled.div`
// 	display: none;
// 	@media (max-width: 768px) {
// 		display: flex;
// 		padding-left: 1rem;
// 		font-size: 14px;
		
// 	}
// `;

const User = styled(NavList)`
	a > img {
		border-radius: 50%;
		width: 25px;
		height: 25px;
	}
	span {
		display: flex;
		align-items: center;
	}
	&:hover {
		${SignOut} {
			@media (min-width: 768px) {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
`;

// const Work = styled(User)`
// 	border-left: 1px solid rgba(0, 0, 0, 0.08);
// `;

function Header(props) {
	const notifications = useSelector((state) => state?.userState?.user?.notifications);
	const authUser = getAuth();
	const userIsLoggedIn = authUser.currentUser;
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredResults, setFilteredResults] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const location = useLocation();
	const [showSignOut, setShowSignOut] = useState(false);

// Function to toggle the SignOut visibility
const toggleSignOut = () => {
  setShowSignOut(!showSignOut);
  console.log(showSignOut)
};

  
	// Function to handle search input change
	const handleSearchChange = (event) => {
		if(location.pathname === '/jobs' || location.pathname === '/chats'){
			return alert('search for articles or connections')
		  }
	  setSearchTerm(event?.target?.value?.toLowerCase());
	};

	const handleResultClick = (result) => {
		if (location.pathname === '/feed' || location.pathname === '/job') {
		  // Find the article element by its id and scroll to it
		  const articleElement = document.getElementById(`article-${result.id}`);
		  if (articleElement) {
			articleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		  }
		} else if (location.pathname === '/chats' || location.pathname === '/explore-connections') {
		  // Navigate to the user's profile using their email
		  navigate(`/profile/${result.email}`);
		}
		setSearchTerm('')
	  };
	  
  
	// Function to filter data based on the current route
	useEffect(() => {
	  if (searchTerm === '') {
		setFilteredResults([]); // Clear results if search is empty
		return;
	  }
	  console.log("Props Data:", props.articles, props.user.connection, allUsers);
  
	  if (location.pathname === '/feed' || location.pathname === '/jobs') {
		// Filter articles or job-related data based on the search term
		const results = props.articles && props.articles.filter((article) =>
		  article.description.toLowerCase().includes(searchTerm)
		);
		setFilteredResults(results);
		console.log("Filtered Articles/Jobs:", results);
	  } else if (location.pathname === '/chats' || location.pathname === '/explore-connections') {
		// Combine followers and following arrays to get all connected emails
		const connectedEmails = [
		  ...(props.user?.connection?.followers || []),
		  ...(props.user?.connection?.following || []),
		];
  
		// Ensure allUsers is defined and has the expected structure
		if (!allUsers || !Array.isArray(allUsers)) {
		  console.warn("allUsers is not defined or is not an array");
		  return;
		}
  
		// Filter the list of all users by matching emails from the connections and search term
		const results = allUsers.filter((user) =>
		  connectedEmails.includes(user.email) &&
		  user.name.toLowerCase().includes(searchTerm)
		);
		setFilteredResults(results);
		console.log("Filtered Connections:", results);
	  }
	}, [
	  searchTerm,
	  location.pathname,
	  props.articles?.length,
	  props.user?.connection?.followers?.length,
	  props.user?.connection?.following?.length,
	]);
  
	// Redirect to login if not logged in
	useEffect(() => {
	  if (!userIsLoggedIn) {
		navigate('/login');
	  }
	}, [userIsLoggedIn, navigate]);
  
	// Fetch all users when component mounts or notifications/articles change
	useEffect(() => {
	  const fetchAllUsers = async () => {
		const profilesCollection = collection(db, 'profiles');
		const profilesSnapshot = await getDocs(profilesCollection);
		const profilesList = profilesSnapshot.docs.map((doc) => ({
		  ...doc.data(),
		  id: doc.id,
		}));
		setAllUsers(profilesList);
	  };
	  fetchAllUsers();
	  props.getArticles();
	}, [notifications?.length, props.articles?.length]);
  
	// Optionally render null or loading state if navigating
	if (!userIsLoggedIn) {
	  return null;
	}
  
	return (
	  <Container className="header">
		<Content>
		  <Logo>
			<a href="/feed">
			  <img src="/images/logo.jpeg" alt="" height={"40px"} />
			</a>
		  </Logo>
		  <span style={{ fontWeight: "600", marginLeft: "-10px", color: "blue", cursor: "pointer" }}>
			Connectify
		  </span>
		  <Search>
			<div>
			  <input
				onChange={handleSearchChange}
				className="rounded"
				type="text"
				placeholder="Search"
			  />
			</div>
			<SearchIcon>
			  <img src="/images/search-icon.svg" alt="" />
			</SearchIcon>
			{/* Display filtered results */}
			<div className="search-results" style={{position:'absolute'}}>
  {filteredResults.map((result, index) => (
    <div 
      key={index}  
      className="search-item bg-white" 
      onClick={() => handleResultClick(result)} >
      {location.pathname === '/feed' || location.pathname === '/job'
        ? <p className="filterList p-2 small">{result.description.slice(0, 50)}...</p> // Display a limited description
        : <p className="filterList p-2">{result.name}</p>}
    </div>
  ))}
</div>
		  </Search>
		  <Nav>
			<NavListWrap>
			  <NavList>
				<NavLink to="/feed" activeClassName="active">
				  <img src="/images/nav-home.svg" alt="" />
				  <span>Home</span>
				</NavLink>
			  </NavList>
			  <NavList>
				<NavLink to="/explore-connections" activeClassName="active">
				  <i className="bi bi-people-fill text-dark fs-5"></i>
				  <span>My Network</span>
				</NavLink>
			  </NavList>
			  <NavList>
				<NavLink to="/jobs" activeClassName="active">
				  <i className="bi bi-briefcase-fill text-dark fs-5"></i>
				  <span>Jobs</span>
				</NavLink>
			  </NavList>
			  <NavList>
				<NavLink to="/chats" activeClassName="active">
				  <i className="bi bi-chat-left-dots-fill text-dark fs-5"></i>
				  <span>Messaging</span>
				</NavLink>
			  </NavList>
			  <NavList>
				<a className="cursor-pointer btn m-0 p-0 border-0" onClick={props.toggleModal}>
				  <span className="bg-danger position-absolute px-1 rounded-circle mr-3 mt-1 top-0">
					{(notifications?.filter(notification => notification.read === false).length)}
				  </span>
				  <i className="bi bi-bell-fill text-dark fs-5"></i>
				  <span>Notifications</span>
				</a>
			  </NavList>
			  <User>
  <a onClick={toggleSignOut}>
    {props.user && props.user.photoURL ? (
      <img src={props.user.photoURL} alt="" />
    ) : (
      <img src="/images/user.svg" alt="" />
    )}
    <span>
      Me <img src="/images/down-icon.svg" alt="" />
    </span>
  </a>
  {/* Conditionally render SignOut based on showSignOut state */}
  {showSignOut && (
    <SignOut className="sign-out rounded" style={{ cursor: "pointer" }} onClick={() => props.signOut()}>
      <a className="fw-semibold text-white">Sign Out</a>
    </SignOut>
  )}
</User>

			</NavListWrap>
		  </Nav>
		</Content>
	  </Container>
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
	signOut: () => dispatch(signOutAPI()),
	getArticles: () => dispatch(getArticlesAPI()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
