import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from "./Login";
import Header from "./Header";
import Home from "./Home";
import { useEffect, useState } from "react";
import { setUser } from '../action/index';
import { fetchUserProfile } from "../action";
import { connect } from "react-redux";
import ProfilePage from './Profile';
import ProfileForm from './ProfileModify'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ConnectionsList from './ConnectionLists'; 
import Spinner from './Spinner';
import Job from './Jobs'; 
import Notification from './Notification'; // Import Notifications component
import Messaging from './Messaging';
import {SavedArticles} from './SaveItem';
import Footer from './Footer';

function AuthProvider({ children, setUser, fetchUserProfile }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserProfile(user.email);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, setUser, fetchUserProfile]);

  if (loading) {
    return <Spinner />;
  }

  return children;
}

function App(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="App">
      <Router>
        <AuthProvider setUser={props.setUser} fetchUserProfile={props.fetchUserProfile}>
          <Header toggleModal={toggleModal} />
          {isModalOpen && (
            <div className="modal-backdrop col">
              <div className="modal-content col-lg-8">
                <Notification />
                <button onClick={toggleModal} className="close-modal"><i className='bi bi-x-lg'></i></button>
              </div>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/feed" element={<Home/>} />
            <Route path='/profile/:email' element={<ProfilePage />} />
            <Route path='/profile/modify' element={<ProfileForm />} />
            <Route path='/login' element={<Login />} />
            <Route path='/explore-connections' element={<ConnectionsList />} />
            <Route path='/jobs' element={<Job />} />
            <Route path='/chats' element={<Messaging/>} />
            <Route path='/saved' element={<SavedArticles/>}/>
          </Routes>
          <Footer/>
        </AuthProvider>
      </Router>
    </div>
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  setUser: (user) => dispatch(setUser(user)),
  fetchUserProfile: (email) => dispatch(fetchUserProfile(email)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
