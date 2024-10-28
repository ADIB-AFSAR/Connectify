import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { fetchUserProfile } from '../action/index';

const ProfileForm = () => {
  const user = useSelector((state) => state.userState.user); 
  console.log(user);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    image  :user?.photoURL || '' ,
    contact: user?.contact || '',
    headline: user?.headline || "",
    location: user?.location || "",
    about: user?.about || "",
    experience: [{ position: "", company: "", description: "", startDate: "", endDate: "" }],
    education: [{ school: "", degree: "", year: "" }],
    skills: [],
    links: [{ title: "", url: "" }]
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);


  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        image  :user.photoURL || '',
        contact: user.contact || '',
        headline: user.headline || '',
        location: user.location || '',
        about: user.about || '',
        experience: user.experience || [{ position: "", company: "", description: "", startDate: "", endDate: "" }],
        education: user.education || [{ school: "", degree: "", year: "" }],
        skills: user.skills || [],
        links: user.links || [{ title: "", url: "" }],
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (e, index, field, arrayName) => {
    const { value } = e.target;
    const updatedArray = [...formData[arrayName]];
    updatedArray[index][field] = value;
    setFormData({ ...formData, [arrayName]: updatedArray });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { position: "", company: "", description: "", startDate: "", endDate: "" }],
    });
  };

  const removeExperience = (index) => {
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: updatedExperience });
  };


  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { school: "", degree: "", year: "" }],
    });
  };
  const removeEducation = (index) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updatedEducation });
    console.log('deleted');
  };

  const handleSkillsChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, skills: value.split(",") });
  };
  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { title: "", url: "" }],
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const db = getFirestore();
      const userEmail = user?.email;

      // Save user profile data to Firestore
      await setDoc(doc(db, 'profiles', userEmail), {
        ...formData,
        email: userEmail,
      });
       
      dispatch(fetchUserProfile());
      alert('Profile saved successfully!');
      navigate('/profile/'+user?.email);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  return (
    <Card className="p-4 my-3 w-75 mx-auto shadow">
      <h3 className="text-center mt-1 mb-4">Edit Profile<span className="float-right"><a href={`/profile/${user?.email}`}>Back</a></span></h3>
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
        <Col md={4}>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={formData?.image}
                // onChange={handleInputChange}
                readOnly
                onClick={()=>{alert('Image cannot be changed to keep the user authencity')}}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                // onChange={handleInputChange}
                readOnly
                onClick={()=>{alert('Name cannot be changed to keep the user authencity')}}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Headline</Form.Label>
              <Form.Control
                type="text"
                name="headline"
                placeholder="Headline"
                value={formData.headline}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>       
        <Col md={4}>
                  <Form.Group>
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact"
                      placeholder="Contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                </Row>
        <Form.Group className="mb-3">
          <Form.Label>About</Form.Label>
          <Form.Control
            as="textarea"
            name="about"
            placeholder="Tell us about yourself"
            rows={3}
            value={formData.about}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <h5>Experience</h5>
        {formData.experience?.map((exp, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Position</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Position"
                      value={exp.position}
                      onChange={(e) => handleArrayChange(e, index, "position", "experience")}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Company</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => handleArrayChange(e, index, "company", "experience")}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Description"
                      value={exp.description}
                      onChange={(e) => handleArrayChange(e, index, "description", "experience")}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => handleArrayChange(e, index, "startDate", "experience")}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => handleArrayChange(e, index, "endDate", "experience")}
                    />
                  </Form.Group>
                </Col>      
                <Col md={3} className="d-flex align-items-end">
                  <Button variant="danger" onClick={() => removeExperience(index)}>
                  <i className="bi bi-trash"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        <Button variant="primary" onClick={addExperience}>
          Add More Experience
        </Button>

        <h5 className="mt-4">Education</h5>
        {formData.education.map((edu, index) => (
          <Row key={index} className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>School</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="School"
                  value={edu.school}
                  onChange={(e) => handleArrayChange(e, index, "school", "education")}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Degree</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleArrayChange(e, index, "degree", "education")}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => handleArrayChange(e, index, "year", "education")}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
                  <Button variant="danger" onClick={() => removeEducation(index)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </Col>
          </Row>
        ))}
        <Button variant="primary" onClick={addEducation}>
          Add More Education
        </Button>

        <h5 className="mt-4">Skills</h5>
        <Form.Group className="mb-3">
          <Form.Label>Skills (comma separated)</Form.Label>
          <Form.Control
            type="text"
            name="skills"
            placeholder="e.g., JavaScript, React, Node.js"
            value={formData.skills.join(", ")}
            onChange={handleSkillsChange}
          />
        </Form.Group>

        <h5 className="mt-4">Links</h5>
        {formData.links.map((link, index) => (
          <Row key={index} className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Title"
                  value={link.title}
                  onChange={(e) => handleArrayChange(e, index, "title", "links")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => handleArrayChange(e, index, "url", "links")}
                />
              </Form.Group>
            </Col>
          </Row>
        ))}
        <Button variant="primary" onClick={addLink}>
          Add More Links
        </Button>
        <Button variant="primary" type="submit" className="mt-3 col-12">
          Save Profile
        </Button>
      </Form>
    </Card>
  );
};

export default ProfileForm;
