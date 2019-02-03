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


export default class Login extends Component<{}> {
  constructor()
    {
        super();
        this.state = { 
           username:'',
           password:'',
        }
        console.log('>>>>>>>>>>>>>>'+global.url);
        this.fetchFunction = this.fetchFunction.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.register = this.register.bind(this);
    }

componentWillMount() {
  NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
    });

  AsyncStorage.getItem('@MyLogin:key', (err, result) => {
      console.log('Result>>>>>>>>>>>>>>>'+result);
      if (result==null) {
        console.log('Need to Logged in>>>> ');
      }else{
        console.log('Already Logged in>>>> ');
        Actions.dashboard();
      }
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
  if(this.state.connected==true){
    if(this.state.username==''| this.state.password==''){
            errorMsg = 'Username or Password cannot be blank';
            this.showAlert();
    }else{

   
    Keyboard.dismiss();
    console.log(this.state.username);
    console.log(this.state.password);

      fetch(global.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user:{
            email:this.state.username,
            password: this.state.password,
            }}),
    })
    .then((response) => response.json())
        .then((responseJson) => {
           // console.log('login data >>>>>>>>>>>>>>>>>>>>'+JSON.stringify(responseJson));
           // console.log(responseJson.status);
           // console.log('>>>>>>'+JSON.stringify(responseJson.tablesDetails[0].companyid));

          console.log('>>>>>>>>>>>>>>>>>>>>>>>......'+ JSON.stringify (responseJson.tablesDetails[0].role));

           if(responseJson.status=='success'){
              AsyncStorage.setItem('@MyLogin:key', 'true');
              AsyncStorage.setItem('@MyCompanyId:key', JSON.stringify(responseJson.tablesDetails[0].companyid));
              AsyncStorage.setItem('@Role:key', JSON.stringify(responseJson.tablesDetails[0].role));   
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
}

showAlert(){
     showMessage({
              message: errorMsg,
              type: "info",
            });
}

register(){
  Actions.register();
}

render() {
    return (
      <View style={styles.container}>
        <Image source={require('../../assets/doddle.jpg')}  style={styles.backgroundImage}/>
        <View style={styles.loginSection}>
            <Image source={require('../../assets/main.png')} style={{height:50, width:200}} resizeMode={'contain'}/>
            <Hoshi label={'Username'} borderColor={'#FB9203'} maskColor={'#ffffff'} labelStyle={{color:'#FB9203'}} onChangeText={(text) => { this.setState({username: text}) }}/>
            <Hoshi label={'Password'} borderColor={'#FB9203'} maskColor={'#ffffff'}  style={{marginTop:'4%'}} labelStyle={{color:'#FB9203'}} onChangeText={(text) => { this.setState({password: text}) }}/>
            <View style={{width:'100%', alignItems:'center'}}>
            <TouchableOpacity style={styles.button} onPress={()=>{this.fetchFunction()}}>
              <Text style={{color:'white'}}>Login</Text>
            </TouchableOpacity>
            <View style={{height:1, backgroundColor:'#E1DFDB', width:'100%', marginTop:'8%', marginBottom:'8%'}}></View>
            <TouchableOpacity style={{justifyContent:'center', alignItems:'center', width:'50%', backgroundColor:'white', height:50, borderRadius:5, borderColor:'#FB9203', borderWidth:1, marginTop:'2%'}} onPress={()=>(this.register())}>
            <Text style={{color:'#FB9203'}}>Register Now</Text>
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
    height:'75%', 
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
