import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import styled from "styled-components";
import Left from "./Left";
import Main from "./Main";
import Right from "./Right";
import ConnectionsList from "./ConnectionLists";
import Notification from "./Notification"; // Import the Notification component

const Container = styled.div`
    max-width: 100%;
`;

const Content = styled.div`
    max-width: 1128px;
    margin: auto;
`;

const Layout = styled.div`
    display: grid;
    grid-template-areas: "left main right";
    grid-template-columns: minmax(0, 5fr) minmax(0, 12fr) minmax(300px, 7fr);
    column-gap: 25px;
    row-gap: 25px;
    margin: 25px 0;
    @media (max-width: 768px) {
        display: flex;
        flex-direction: column;
        padding: 0 5px;
    }
`;

function Home({ showNotifications}) {
    const user = useSelector((state) => state.userState.user);
    const [showConnections, setShowConnections] = useState(false);

    const toggleConnectionList = () => {
        setShowConnections(!showConnections);
    };

    return (
        <Container>
            {!user && <Navigate to="/" />}
            <Content>
                <Layout>
                    <Left toggleConnectionList={toggleConnectionList} />
                    {showConnections ? (
                        <ConnectionsList toggleConnectionList={toggleConnectionList} />
                    ) : showNotifications ? (
                        <Notification /> // Render the Notification component if showNotifications is true
                    ) : (
                        <Main />
                    )}
                    <Right />
                </Layout>
            </Content>
        </Container>
    );
}

export default Home;
