/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ImageBackground,
  Keyboard,
  NetInfo,
  AsyncStorage,
  BackHandler
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import Routes from '../Routes';
import { showMessage, hideMessage } from "react-native-flash-message";

var errorMsg = '';


export default class Register extends Component<{}> {
  constructor()
    {
        super();
        this.state = { 
          username:'',
           password:'',
           companyid:''
        }
    }

componentWillMount() {
  NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
    });
  
}

componentDidMount() {
   NetInfo.isConnected.fetch().then(isConnected =>{
    this.setState({connected:isConnected}); 
    });
  NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
}

componentWillUnmount() {
  NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
}

_handleConnectionChange = (isConnected) => {
  console.log('Network state:::'+this.state.connected);
    this.setState({connected:isConnected});
  };

handleBackPress = () => {
  console.log('In backhandler condition');
   BackHandler.exitApp();// works best when the goBack is async
    return false;
  }

fetchFunction(){
  var email = this.state.email;

if( /(.+)@(.+){2,}\.(.+){2,}/.test(email) ){


  if(this.state.connected==true){
    if(this.state.email==''| this.state.password=='' | this.state.companyid==''){
            errorMsg = 'Password or company ID cannot be blank';
            this.showAlert();
    }else{

   
    Keyboard.dismiss();
    console.log(this.state.email);
    console.log(this.state.password);

      fetch(global.registerUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user:{
            email:this.state.email,
            password: this.state.password,
            companyid: this.state.companyid,
            }}),
    })
    .then((response) => response.json())
        .then((responseJson) => {
           console.log('login data >>>>>>>>>>>>>>>>>>>>'+JSON.stringify(responseJson));
           console.log(responseJson.status);
           console.log('>>>>>>'+JSON.stringify(responseJson.companyid));
           if(responseJson.status=='success'){
              AsyncStorage.setItem('@MyLogin:key', 'true');
              AsyncStorage.setItem('@MyCompanyId:key', JSON.stringify(responseJson.companyid));   
              Actions.dashboard();
           }else{
            errorMsg= responseJson.message;
            this.showAlert();
           }
        })
       .catch((error) => {
          console.error(error);
        });
    }

  }else{
    console.log('Network state:::'+this.state.connected);
    errorMsg= "No Network";
    this.showAlert();
  }
    } else {
   errorMsg= "Email not vaild";
    this.showAlert();
  }
}

showAlert(){
   showMessage({
              message: errorMsg,
              type: "info",
            });
}

backlogin(){
  Actions.login();
}

render() {
    return (
      <View style={styles.container}>
        <Image source={require('../../assets/doddle.jpg')}  style={styles.backgroundImage}/>
        <View style={styles.loginSection}>
          
            <Hoshi label={'Email'} borderColor={'#FB9203'} maskColor={'#ffffff'} labelStyle={{color:'#FB9203'}} onChangeText={(text) => { this.setState({email: text}) }}/>
            <Hoshi label={'Password'} borderColor={'#FB9203'} maskColor={'#ffffff'}  style={{marginTop:'4%'}} labelStyle={{color:'#FB9203'}} onChangeText={(text) => { this.setState({password: text}) }}/>
             <Hoshi label={'Company ID'} borderColor={'#FB9203'} maskColor={'#ffffff'}  style={{marginTop:'4%'}} labelStyle={{color:'#FB9203'}} onChangeText={(text) => { this.setState({companyid: text}) }}/>
            <View style={{width:'100%', alignItems:'center'}}>
            <TouchableOpacity style={styles.button} onPress={()=>{this.fetchFunction()}}>
              <Text style={{color:'white'}}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginTop:'5%'}} onPress={()=>{this.backlogin()}}>
              <Text style={{color: '#FB9203'}}>Back to Login</Text>
            </TouchableOpacity>
          </View>       
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FB9203'
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    opacity: .5, // or 'stretch'
    position:'relative'
  },
  loginSection: {
    paddingTop:'10%',
    width:'70%', 
    height:'70%', 
    position:'absolute', 
    top: '15%', 
    bottom: 0, 
    left: '15%', 
    right: 0,
    zIndex: 1,
    backgroundColor:'white',
    paddingLeft:'5%',
    paddingRight:'5%',
    justifyContent:'center'
  },
  TextInputStyle:{
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1,
    width:'90%',
  },
   input: {
    marginTop: 4,
  },
  button:{justifyContent:'center', alignItems:'center', width:'50%', backgroundColor:'#FB9203', height:50, marginTop:'10%', borderRadius:5}
});
