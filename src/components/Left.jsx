import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import styled from "styled-components"; 

const Container = styled.div`
  grid-area: left;
  @media (max-width: 768px) {
    grid-area: unset;
    width: 100%;
  }
`;

const ArtCard = styled.div`
  text-align: center;
  overflow: hidden;
  margin-bottom: 8px;
  border-radius: 1.5rem;
  ${'' /* background-color: #fff; */}
  transition: box-shadow 83ms;
  position: relative;
  ${'' /* border: none; */}
  ${'' /* box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%); */}
  @media (max-width: 768px) {
    text-align: left;
    margin-bottom: 16px;
  }
`;

const UserInfo = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding: 12px 12px 16px;
  word-wrap: break-word;
  word-break: break-word;
  @media (max-width: 768px) {
    padding: 12px 8px 16px;
  }
`;

const CardBackground = styled.div`
  background: url("/images/card-bg.svg");
  background-position: center;
  background-size: 462px;
  height: 54px;
  margin: -12px -12px 0;
  @media (max-width: 768px) {
    background-size: cover;
    height: 48px;
  }
`;

const Photo = styled.div`
  box-shadow: none;
  background: url(${(props) => props.photoUrl});
  width: 72px;
  height: 72px;
  box-sizing: border-box;
  background-clip: content-box;
  background-color: #fff;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid white;
  margin: -38px auto 12px;
  border-radius: 50%;
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    margin: -30px auto 8px;
  }
`;

// const Link = styled.div`
//   font-size: 16px;
//   line-height: 1.5;
//   color: rgba(0, 0, 0, 0.9);
//   font-weight: 600;
//   @media (max-width: 768px) {
//     font-size: 14px;
//   }
// `;

// const AddPhotoText = styled.div`
//   color: #0a66c2;
//   margin-top: 4px;
//   font-size: 12px;
//   line-height: 1.33;
//   font-weight: 400;
//   @media (max-width: 768px) {
//     font-size: 11px;
//   }
// `;

const Widget = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  padding: 12px 0;
  & > a {
    text-decoration: none !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    @media (max-width: 768px) {
      padding: 4px 8px;
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
    div {
      display: flex;
      flex-direction: column;
      text-align: left;
      span {
        font-size: 12px;
        line-height: 1.333;
        &:first-child {
          color: rgba(0, 0, 0, 0.6);
        }
        &:nth-child(2) {
          color: #000;
        }
        @media (max-width: 768px) {
          font-size: 11px;
        }
      }
    }
  }
`;

const Item = styled.a`
  display: block;
  border-color: rgba(0, 0, 0, 0.6);
  text-align: left;
  padding: 12px;
  font-size: 12px; 
  span {
    display: flex;
    align-items: center;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.08); 
  }
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 11px;
  }
`;

const CommunityCard = styled(ArtCard)`
  padding: 8px 0 0; 
  text-align: left;
  display: flex;
  flex-direction: column; 
  a {
    color: #000;
    padding: 4px 12px;
    font-size: 12px;
    @media (max-width: 768px) {
      padding: 4px 8px;
      font-size: 11px;
    }
    &:hover {
      color: #0a66c2;
    }
    span {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &:last-child {
      color: rgba(0, 0, 0, 0.6);
      border-top: 1px solid #d6cec2;
      padding: 12px;
      background-color :white;  
      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }
    }
  }
`;
function Left({ user,toggleConnectionList}) {
	let photoUrl = user?.photoURL || "/images/photo.svg"; 
	return (
		<Container>
			<ArtCard className="effect text-center">
				<UserInfo>
					<CardBackground />
					<a href={`/profile/${user?.email}`}>
						<Photo photoUrl={photoUrl} />
					</a>
					<p className="small">
						{user?.headline}
					</p>
						<p className="fw-semibold">Welcome, {user ? user.name : "there"}!</p>
				</UserInfo>
				<Widget>
					<a onClick={toggleConnectionList}>
						<div>
							<span>Connections</span>
							<span>Grow Your Network</span>
						</div>
						<img src="/images/widget-icon.svg" alt="Connections Widget Icon" />
					</a>
				</Widget>
				<Item className="bg-white">
        <a href="/saved">
					<span className="text-dark">
						<img src="/images/item-icon.svg" alt="My Items Icon" />
						My Items
					</span>
          </a>
				</Item>
			</ArtCard>
			<CommunityCard className="shadow-lg">
				<a>
					<span>Groups</span>
				</a>
				<a>
					<span>
						Events
						<img src="/images/plus-icon.svg" alt="Add Event Icon" />
					</span>
				</a>
				<a>
					<span>Follow Hashtags</span>
				</a>
				<a>
					<span>Discover More</span>
				</a>
			</CommunityCard>
		</Container>
	);
}

Left.propTypes = {
	user: PropTypes.shape({
		displayName: PropTypes.string,
		photoURL: PropTypes.string,
	}),
};

const mapStateToProps = (state) => ({
	user: state.userState.user,
});

export default connect(mapStateToProps)(Left);
