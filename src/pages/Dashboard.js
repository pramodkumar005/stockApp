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
  ListView,
  BackHandler,
  AsyncStorage,
  BackAndroid,
  Alert
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import ListOutstanding from './ListOutstanding';
import ListProducts from './ListProducts';
import SalesOrder from './SalesOrder';
import SalesOrder_2 from './SalesOrder_2';
import ProductOrder_2 from './ProductOrder_2';
import ListOrders from './ListOrders';
import TabNavigator from 'react-native-tab-navigator';


var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});

export default class Dashboard extends Component<{}> {
  constructor(props)
    {
        super();
        this.state = { 
          dataSource:ds.cloneWithRows(['']),
          dataLoaded: false,  
          selectedTab: ''    
        }
            this.logOut = this.logOut.bind(this);
    }

componentDidMount(){
  //  if (this.props.selectedTab == 'SALESORDER') {
  //     this.setState({
  //       selectedTab: 'SALESORDER'
  //     }) 
  // }
}

componentWillMount() {

  AsyncStorage.getItem('@Role:key', (err, result) => {
      console.log('Result>>>>>>>>>>>>>>>'+ JSON.stringify (result));
      if (result==null) {
        console.log('Role of the loged in user is null>>>> '+result);
      }else{
        console.log('Role of the loged in user>>>> '+result);
        //Actions.dashboard();
        if (result.slice(1,-1)=='O') {
          this.setState({
            role:'O'
          })
        }else{
          this.setState({
            role:'S'
          },()=>{
            this.setState({
              selectedTab: 'ORDERS'
            })
          })
          console.log('user is salesman>>>>>>>>>>>>>>>>>>>>');
        }
      }
    });

  console.log('Props lastPage>>>>>>>>>>>>>>>'+this.props.lastPage);
  if(this.props.lastPage=='productOrder_2'){
    console.log('i am in if>>>>>.....');
    this.setState({
      selectedTab: 'SALESORDER'
    })
  }else{
    console.log('i am in else>>>>>.....');
    if (this.state.role=='S') {
      this.setState({
        selectedTab: 'ORDERS'
      })
    } else {
      this.setState({
        selectedTab: 'OUTSTANDING'
      })
    }
  }

  AsyncStorage.getItem('@MyLogin:key', (err, result) => {
      console.log('Result>>>>>>>>>>>>>>>'+result);
      if (result==null) {
        Actions.login();
      }else{
        console.log('Already Logged in>>>> ');
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress.bind(this));
        //Actions.dashboard();
      }
    });


   console.log('>>>>>>>>>componentWillMount>>>dashboard');
  BackHandler.addEventListener('hardwareBackPress', this.handleBackPress.bind(this));
}



componentWillUnmount() {
  console.log('>>>>>>>>>componentWillUnmount ----dashboard');
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress.bind(this));
}

handleBackPress = () => {
  console.log('I am in back action dashboard');
  this.exitConfirmation();
  return true;
}

logOut(){
  AsyncStorage.removeItem('@MyLogin:key');
  AsyncStorage.removeItem('@MyCompanyId:key');
  Actions.login();
}

onPressRow(){
  //console.log(rowData.id);
  this.popupDialog.show();
}


exitConfirmation(){
    Alert.alert(
    'CONFIRM',
    'Are you sure want to exit app ?',
    [
      {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'destructive'},
      {text: 'OK', onPress: () => BackHandler.exitApp()},
    ],
    { cancelable: false }
  )
}

render() {
    return (
      <View style={styles.container}>
        <View style={{height:30, justifyContent:'center', marginTop:'1%', justifyContent:'space-between', flexDirection:'row', marginLeft:'2%'}}>
          <View>
            <Text style={{fontSize:20, marginLeft:'5%', color: "#FB9203"}}>{this.state.selectedTab}</Text>
          </View>
          <TouchableOpacity onPress={()=>{this.logOut()}}>
            <Text style={{fontSize:15, marginLeft:'5%', color: "#FB9203"}}>LogOut</Text>
          </TouchableOpacity>
        </View>


        {(this.state.role=='O')?
          <TabNavigator tabBarStyle={{ height: 50, overflow: 'hidden', alignItems:'center', justifyContent:'center'}} >
                  <TabNavigator.Item
                    selected={this.state.selectedTab === 'OUTSTANDING'}
                    title="OUTSTANDING"
                    onPress={() => this.setState({ selectedTab: 'OUTSTANDING' })}
                    selectedTitleStyle={{color: "#FB9203", fontSize:12}}
                    titleStyle={{fontSize:12}}
                    >
                    <ListOutstanding />
                  </TabNavigator.Item>
                  <TabNavigator.Item
                    selected={this.state.selectedTab === 'PRODUCTS'}
                    title="PRODUCTS"
                    onPress={() => this.setState({ selectedTab: 'PRODUCTS' })}
                    selectedTitleStyle={{color: "#FB9203", fontSize:12}}
                    titleStyle={{fontSize:12}}>
                    <ListProducts />
                  </TabNavigator.Item>
                   <TabNavigator.Item
                    selected={this.state.selectedTab === 'ORDERS'}
                    title="ORDERS"
                    onPress={() => this.setState({ selectedTab: 'ORDERS' })}
                    selectedTitleStyle={{color: "#FB9203", fontSize:12}}
                    titleStyle={{fontSize:12}}>
                    <ListOrders />
                  </TabNavigator.Item>
                    <TabNavigator.Item
                    selected={this.state.selectedTab === 'SALESORDER'}
                    title="SALES ORDER"
                    onPress={() => this.setState({ selectedTab: 'SALESORDER' })}
                    selectedTitleStyle={{color: "#FB9203", fontSize:12}}
                    titleStyle={{fontSize:12}}>
                    <SalesOrder_2 />
                  </TabNavigator.Item>
          </TabNavigator>
          :
          <TabNavigator tabBarStyle={{ height: 50, overflow: 'hidden', alignItems:'center', justifyContent:'center'}} >
                   <TabNavigator.Item
                    selected={this.state.selectedTab === 'ORDERS'}
                    title="ORDERS"
                    onPress={() => this.setState({ selectedTab: 'ORDERS' })}
                    selectedTitleStyle={{color: "#FB9203", fontSize:12}}
                    titleStyle={{fontSize:12}}>
                    <ListOrders />
                  </TabNavigator.Item>
                    <TabNavigator.Item
                    selected={this.state.selectedTab === 'SALESORDER'}
                    title="SALES ORDER"
                    onPress={() => this.setState({ selectedTab: 'SALESORDER' })}
                    selectedTitleStyle={{color: "#FB9203", fontSize:12}}
                    titleStyle={{fontSize:12}}>
                    <SalesOrder_2 />
                  </TabNavigator.Item>
          </TabNavigator>
        }


         <PopupDialog
            dialogTitle={<DialogTitle title="Confirm" />}
           dialogAnimation={slideAnimation}
              height= {175}
              width={0.9}
              dialogStyle={{marginTop:-225}}
              dismissOnHardwareBackPress = {true}
              ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
              <View style={{width:'100%', marginTop:'2%', justifyContent:'center', alignItems:'center'}}>
                  <Text>Are you sure want to exit the app ?</Text>
                <View style={{flexDirection:'row'}}>
                 <TouchableOpacity style={styles.button}>
                    <Text style={{color:'#FB9203'}}>Yes</Text>
                  </TouchableOpacity> 
                  <TouchableOpacity style={[styles.button2,{marginLeft:'5%'}]} onPress={()=>{this.popupDialog.dismiss()}}>
                    <Text style={{color:'white'}}>No</Text>
                  </TouchableOpacity>   
                </View>                                          
              </View>
          </PopupDialog>        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  button:{
    justifyContent:'center', 
    alignItems:'center', 
    width:'35%', 
    borderColor:'#FB9203', 
    height:40, 
    marginTop:'5%', 
    borderRadius:5,
    borderWidth:1
  },
  button2:{
    justifyContent:'center', 
    alignItems:'center', 
    width:'35%', 
    backgroundColor:'#FB9203', 
    height:40, 
    marginTop:'5%', 
    borderRadius:5,
    borderWidth:1
  }
});
