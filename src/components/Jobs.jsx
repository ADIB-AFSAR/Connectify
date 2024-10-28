import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getArticlesAPI } from '../action';
import { useNavigate } from 'react-router-dom';

const JobComponent = (props) => {
  const [jobPosts, setJobPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    props.getArticles();
  }, [props]);

  useEffect(() => {
    // List of keywords to check for
    const keywords = ['job', 'freshers', 'hiring', 'intern', 'position', 'opening'];
    // Filter articles that contain any of the keywords in the description
    const filteredArticles = props?.articles.filter((article) =>
      article.description &&
      keywords.some((keyword) => article.description.toLowerCase().includes(keyword))
    );

    setJobPosts(filteredArticles);
  }, [props.articles]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="container  mt-4" style={{height:'100vh'}}>
      <h2 className="text-center mb-4"><a href='/feed'><i className='text-dark bi bi-arrow-left float-left fs-5'></i></a>Job Opportunities</h2>
      <div className="row">
        {jobPosts.length > 0 ? (
          jobPosts.map((post, index) => (
            <div className="col-md-6 mb-3" key={index}>
              <div className="card shadow-lg">
                <div className="card-body">
                <a className='cursor-pointer text-dark' onClick={() => {
                      navigate(`/profile/${post.actor.description}`);
                    }}>
                  <img            
                    height={'40px'}
                    src={post.actor.image}
                    className="rounded"
                    alt={post.actor.title}
                  /> {post.actor && (
                <span className='small text-muted float-right'>
                  {formatTimestamp(post.actor.date)}
                </span>
              )}</a>
                  <h5 className="card-title mb-0">{post.actor.title || 'Untitled Post'}</h5>
                  <p className="card-text small">{post.actor.description}</p>
                  
                  
                  <p className="card-text mt-3">
                    {post.description || 'No description available'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p>No job-related posts available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  articles: state.articleState.articles,
});

const mapDispatchToProps = (dispatch) => ({
  getArticles: () => dispatch(getArticlesAPI()),
});

export default connect(mapStateToProps, mapDispatchToProps)(JobComponent);
