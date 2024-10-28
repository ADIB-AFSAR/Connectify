import React, { useState, useEffect } from 'react'; 
import { doc, setDoc, arrayUnion, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import db, { auth } from '../firebase.config';
import { useNavigate } from 'react-router-dom';

const handleSaveArticle = async (article) => {
  const currentUser = auth.currentUser; // Get the current user
  if (!currentUser) return;

  const profileRef = doc(db, 'profiles', currentUser.email);

  // Update the profile document to include the new article
  await setDoc(profileRef, {
    savedArticles: arrayUnion(article) // Use arrayUnion to add the article
  }, { merge: true });
  console.log('saved:',article);
};

const handleDeleteArticle = async (article) => {
    const currentUser = auth.currentUser; // Get the current user
    if (!currentUser) return;
  
    const profileRef = doc(db, 'profiles', currentUser.email);
  
    // Update the profile document to remove the article
    await updateDoc(profileRef, {
      savedArticles: arrayRemove(article) // Use arrayRemove to remove the article
    });
  };

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedArticles = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const profileRef = doc(db, 'profiles', currentUser.email);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const savedArticles = profileDoc.data().savedArticles;
        setSavedArticles(savedArticles);
        setLoading(false);
      }
    };

    fetchSavedArticles();
  }, []);
  const navigate = useNavigate()

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="container mt-4">
      <h2 className="text-center mb-4"><a href='/feed'><i className='text-dark bi bi-arrow-left float-left fs-5'></i></a>Saved items</h2>
      <div className="row">
        {savedArticles?.length > 0 ? (
          savedArticles?.map((article, index) => (
            <div className="col-md-6 mb-3" key={index}>
              <div className="card shadow-lg">
                <div className="card-body">
                <span className='cursor-pointer text-dark' onClick={() => {
                      navigate(`/profile/${article.actor.description}`);
                    }}>
                  <img            
                    height={'40px'}
                    src={article.actor.image}
                    className="rounded"
                    alt={article.actor.title}
                  /> {article.actor && (
                <span className='small text-muted float-right'>
                  {formatTimestamp(article.actor.date)}
                </span>
              )}</span>
                  <h5 className="card-title mb-0">{article.actor.title || 'Untitled article'}</h5>
                  <p className="card-text small">{article.actor.description}</p>
                  <p className="card-text mt-3">
                    {article.description || 'No description available'}
                  </p>
                  {article.sharedImg && <img height={'100%'} width={'100%'} src={article.sharedImg} alt="" />}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p>No articles saved yet!!.</p>
          </div>
        )}
      </div>
    </div>
      )}
    </div>
  );
};

export { handleSaveArticle, SavedArticles , handleDeleteArticle };