 import React, { useEffect, useState } from 'react';
import {useSelector} from 'react-redux'; 
import { Link, useParams } from 'react-router-dom';
import { fetchIndividualFromFirestore } from '../action'; 

const ProfilePage = () => {
  const [emailHolderDetails , setEmailHolderDetails] = useState(null)
  const currentUser = useSelector((state) => state.userState.user); 
    const {email} = useParams() 
    useEffect(() => {
      const fetchProfile = async () => {
        const fetchedProfile = await fetchIndividualFromFirestore(email);
        console.log("emailholderDetails:", fetchedProfile);
        setEmailHolderDetails(fetchedProfile);
      };
    
      fetchProfile();
    }, [email]);

  return (
    <div>
      {/* Profile Header */}
      <div className="profile-header bg-primary text-white text-center p-4">
        <div className="container ">
        <a href='/feed' className='text-white float-left'><i className='bi bi-arrow-left fs-5'></i></a>
        <Link to={{pathname: '/profile/modify'}}  style={{position : 'relative',float:'right' , color : 'white'}}>{currentUser?.email === email ? <i className='bi bi-pencil-fill fs-5'></i> : null}</Link>
          <div className="row align-items-center">
            <div className="col-md-4 offset-md-4">
              <img 
                style={{height : '90px'}}
                src={emailHolderDetails?.image || '/images/user.svg'} 
                className="img-fluid rounded-circle"
                alt=''
              />
            </div>
            <div className='d-flex justify-content-center align-items-center'>
        <h4>Followers :</h4>
        <ul>
          {emailHolderDetails?.connection?.followers?.map((follower,index) => (
            <li className='list-unstyled mx-1' key={index}>{index+1}</li>
          ))}
        </ul>
        <h4>Following :</h4>
        <ul>
          {emailHolderDetails?.connection?.following?.map((following,index) => (
            <li className='list-unstyled mx-1' key={index}>{index+1}</li>
          ))}
        </ul>
      </div>
          </div>
          <h2 className="mt-2">{emailHolderDetails?.name || emailHolderDetails?.displayName}</h2>
          <p>{emailHolderDetails?.headline}</p>
          <p>{emailHolderDetails?.about}</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-info container mt-4">
        <div className="row">
          {/* Left Column */}
          <div className="col-md-8">
            {/* Experience Section */}
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h5 className="card-title">Experience</h5>
                {emailHolderDetails && emailHolderDetails?.experience && emailHolderDetails?.experience.map((exp,index)=>{
                 return <div className="mb-3" key={index}>
                  <h6>{exp.position} @ {exp.company}</h6>
                  <p>{exp.startDate} - {exp.endDate}</p>
                  <p>{exp.description}</p>
                </div>
                })}
              </div>
            </div>

            {/* Education Section */}
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h5 className="card-title">Education</h5>
                
                {emailHolderDetails?.education && emailHolderDetails?.education.map((edu,index)=>{
                 return <div className="mb-3" key={index}>
                  <h6>{edu.degree}</h6>
                  <p>{edu.school}, {edu.year}</p>
                </div>
                })}
              </div>
            </div>

            {/* Skills Section */}
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h5 className="card-title">Skills</h5>
                <div className="d-flex flex-wrap">            
                  {emailHolderDetails?.skills && emailHolderDetails?.skills.map((skill,index)=>{
                    return <span className="badge badge-primary m-1 p-2" key={index}>{skill}</span>
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-4 ">
            {/* Contact Info Section */}
            <div className="card mb-4 contact-info shadow">
              <div className="card-body">
                <h5 className="card-title">Contact Info</h5>
                <ul className="list-unstyled">
                  <li><strong>Email:</strong> {emailHolderDetails?.email}</li>
                  <li><strong>Phone:</strong> {emailHolderDetails?.contact}</li>
                  <li><strong>Location:</strong> {emailHolderDetails?.location}</li>
                </ul>
              </div>
            </div>

            {/* Social Links */}
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h5 className="card-title">Social Links</h5>
                <ul className="list-unstyled">
                  {emailHolderDetails?.links && emailHolderDetails?.links.map((link,index)=>{
                   return <li key={index}><i className={`bi bi-${(link.title).toLowerCase()} mx-2`}></i><a href={link.url}>{link.title}</a></li>
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
