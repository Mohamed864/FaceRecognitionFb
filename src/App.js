import React,{ Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/faceRecognition/FaceRecognition';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm';
import Rank from './components/rank/Rank';
import SignIn from './components/signIn/SignIn';
import Register from './components/regiser/Register';
import './App.css';

const app = new Clarifai.App({
  apiKey: '4331d6a9cb5b4593b76ecc20e9ef0ec2'
});

const particlesOption = {

      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 800
          }
        }
      }
}
class App extends Component {
  constructor() {
    super();
    this.state = {
      input:'',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width , height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }
 
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => {
          if (response){
              fetch('http://localhost:3000/image', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                   id: this.state.user.id
                })
              })
              .then(count => count.json())
              .then(me => {
                this.setState(Object.assign(this.state.user, {entries:me}))
              })
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log("error"));
    
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOption} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        { 
          this.state.route === 'home'
               ?<div>
                 <Logo />
                 <Rank 
                    name={this.state.user.name}
                    entries={this.state.user.entries}
                  />
                 <ImageLinkForm
                    onInputChange = {this.onInputChange}
                    onButtonSubmit = {this.onButtonSubmit}
                 />
                 <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
                </div>
            :(
                this.state.route === 'signin' 
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              )
            
        }
      </div>
    );
  }
}

export default App;
