import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

const Container = styled.div`
	grid-area: right;
	@media (max-width: 768px) {
		margin-bottom: 35px;
	}
`;

const FollowCard = styled.div`
	text-align: center;
	overflow: hidden;
	margin-bottom: 8px;
	background-color: #fff;
	border-radius: 5px;
	border: none;
	position: relative;
	box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
	padding: 12px;
`;

const Title = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: space-between;
	font-size: 16px;
	width: 100%;
	color: rgba(0, 0, 0, 0.6);
`;

const FeedList = styled.ul`
	margin-top: 16px;
	li {
		box-shadow :0 0 ;
		display: flex;
		align-items: center;
		margin: 12px 0;
		position: relative;
		font-size: 14px;
		& > div {
			display: flex;
			flex-direction: column;
		}
		button {
			background-color: transparent;
			color: rgba(0, 0, 0, 0.6);
			box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.6);
			padding: 16px;
			align-items: center;
			border-radius: 15px;
			box-sizing: border-box;
			font-weight: 600;
			display: inline-flex;
			justify-content: center;
			max-height: 32px;
			max-width: 480px;
			text-align: center;
			border: none;
		}
	}
`;

const Avatar = styled.div`
	background: url("https://static-exp1.licdn.com/sc/h/1b4vl1r54ijmrmcyxzoidwmxs");
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	width: 48px;
	height: 48px;
	margin-right: 8px;
`;

const Recommendation = styled.a`
	display: flex;
	align-items: center;
	font-size: 14px;
	color: #0a66c2;
	img {
		margin-left: 5px;
	}
`;

const BannerCard = styled(FollowCard)`
	img {
		width: 100%;
		height: 100%;
	}
`
function Right() {
  const currentUser = useSelector(state => state.userState.user);
  const [followState, setFollowState] = useState({});

   
  useEffect(() => {
    if (currentUser) {
      const storedFollowState = localStorage.getItem(`followState_${currentUser.email}`);
      if (storedFollowState) {
        setFollowState(JSON.parse(storedFollowState));
      }
    }
  }, [currentUser]);

  const handleToggleFollow = (feedItem) => {
    const updatedFollowState = {
      ...followState,
      [feedItem]: !followState[feedItem],
    };

    setFollowState(updatedFollowState);
    localStorage.setItem(`followState_${currentUser.email}`, JSON.stringify(updatedFollowState));
  };

  return (
    <Container>
      <FollowCard className="shadow-lg">
        <Title>
          <h2>Add to your feed</h2>
          <div className="info-button-container">
            <i className="bi bi-info-circle text-dark bg-transparent info-button"></i>
            <span className="info-message">community and peoples</span>
          </div>
        </Title>
        <FeedList className="effect p-2">
          {['#Connectify', '#trending'].map((feedItem) => (
            <li key={feedItem}>
              <span>
                <Avatar />
              </span>
              <div>
                <span>{feedItem}</span>
                <button onClick={() => handleToggleFollow(feedItem)}>
                  {followState[feedItem] ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            </li>
          ))}
        </FeedList>
        <Recommendation className="my-2">
          <a href="/explore-connections">View all recommendations</a>
          <img src="/images/right-icon.svg" alt="" />
        </Recommendation>
      </FollowCard>
      <BannerCard className="m-0 p-0">
        <div id="carouselExampleControls" className="carousel slide" data-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img className="d-block w-100" src="./images/pic-1.png" alt="First slide" />
            </div>
            <div className="carousel-item">
              <img className="d-block w-100" src="./images/team.jpg" alt="Second slide" />
            </div>
            <div className="carousel-item">
              <img className="d-block w-100" src="./images/chats.jpg" alt="Third slide" />
            </div>
            <div className="carousel-item">
              <img className="d-block w-100" src="./images/pic-2.jpg" alt="Fourth slide" />
            </div>
          </div>
          <a className="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="sr-only">Previous</span>
          </a>
          <a className="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="sr-only">Next</span>
          </a>
        </div>
      </BannerCard>
    </Container>
  );
}
 
export default Right;
