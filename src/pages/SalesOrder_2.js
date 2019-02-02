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
  NetInfo,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  AsyncStorage,
  FlatList,
  RefreshControl
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import { filter, indexOf, invert, findKey } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-material-dropdown';
import {Dimensions} from 'react-native';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { showMessage, hideMessage } from "react-native-flash-message";

const deviceW = Dimensions.get('window').width
const basePx = 375
function px2dp(px) {
  return px *  deviceW / basePx
}

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var partyArray=[];
var productArray=[];


export default class SalesOrder_2 extends Component<{}> {
  constructor()
    {
        super();
        this.state = { 
           companyId:'',
           dataSource:ds.cloneWithRows(['']),
           data:'',
           dataLoaded: false,
           refreshing: false,
        }
    this.fetchFunction = this.fetchFunction.bind(this);
    this.setSearchText = this.setSearchText.bind(this);
    this.productOrderPage = this.productOrderPage.bind(this);
    this.showMessageBar = this.showMessageBar.bind(this);
    this.fetchExport = this.fetchExport.bind(this);
    }

componentWillMount(){
    NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
    });
}

componentDidMount() {
NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);

  AsyncStorage.getItem('@MyCompanyId:key', (err, result) => {
      console.log('Result>>>>>>>>>>>>>>>'+result);
      if (result!==null) {
        console.log('Result::'+result);
        this.setState({
          companyId:result
        },()=>{this.fetchFunction()})
      }else{
        console.log('No result >>>> ');
      }
    });
}

componentWillUnmount() {
  //MessageBarManager.unregisterMessageBar(this.refs.alert);
  NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
}

_handleConnectionChange = (isConnected) => {
  console.log('Network state:::'+this.state.connected);
    this.setState({connected:isConnected});
   if(isConnected==true){
      this.fetchFunction();
    }else{
      console.log('Connection change>>>>>no network');
    }
  };



fetchFunction(){
console.log('Fetching>>>>>>>>>>>>>>>>>>>>'+global.outstandingUrl+ this.state.companyId.slice(1,-1));
let compID =  this.state.companyId.slice(1,-1);
console.log('Connection status::' + compID);
NetInfo.isConnected.fetch().then(isConnected =>{

    console.log('Connection status::'+isConnected +"::" + compID);
    if(isConnected==true) {  
    this.setState({connected:true}); 
    fetch(global.outstandingUrl+compID, {
    method: 'GET',
    headers: {
     'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {
         //console.log('customers>>>>>>>>'+ JSON.stringify(responseJson.tablesDetails));
         this.setState({
          dataSource: ds.cloneWithRows(responseJson.tablesDetails),
          data: responseJson.tablesDetails,
          dataLoaded: true,
          refreshing: false
         });
         //console.log(this.state.dataSource);
      })
     .catch((error) => {
        console.error(error);
      });
   } else {
    console.log('No network');
    this.setState({
      connected:false
    });
   }
});
}


_keyExtractor = (item, index) => item.id;


setSearchText(event) {
     let searchText = event.nativeEvent.text;
     this.setState({searchText:event});
     data = this.state.data;
     let filteredData = this.filterNotes(searchText, data);
     const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

     this.setState({
       dataSource: ds.cloneWithRows(filteredData),
       rawData: data,
     });
    }

filterNotes(searchText, notes) {
      let text = searchText.toLowerCase();
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>notes::'+notes);
      return filter(notes,(n) => {
         console.log(":::::"+n.name);
        let note = n.name.toLowerCase();
        return note.search(text) !== -1;
      });
    }

_onRefresh = () => {
  if(this.state.connected==true) {
    this.setState({refreshing: true});
    this.fetchFunction()
    // fetchData().then(() => {
    //   this.setState({refreshing: false});
    // });
  }else {
    this.setState({refreshing: false})
  }
}

showMessageBar(){
  showMessage({
              message: "No network",
              type: "info",
            });
}

productOrderPage(rowData){
  console.log('selected data'+ rowData.id);
  // if(this.state.connected==true){
    Actions.productorder_2({customerDetails: rowData});
  // }else{
  //   this.showMessageBar();
  // }
  
}


fetchExport(){
console.log('Fetching sync>>>>>>>>>>>>>>>>>>>>'+global.exportSalesOrder+ this.state.companyId.slice(1,-1));
let compID =  this.state.companyId.slice(1,-1);
console.log('Connection status::' + compID);
NetInfo.isConnected.fetch().then(isConnected =>{

    console.log('Connection status::'+isConnected +"::" + compID);
    if(isConnected==true) {  
    this.setState({connected:true}); 
    fetch(global.exportSalesOrder+compID, {
    method: 'GET',
    headers: {
     'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {
         console.log(responseJson.responsecode);
         
         if (responseJson.responsecode==200) {
          this.fetchFunction();
          console.log('responsecode is  200');
          errorMsg = 'Exported successfully'
          this.showAlert();

         }else{
          console.log('responsecode is not 200');
          errorMsg = 'Unable to export'
          this.showAlert();

         }
      })
     .catch((error) => {
        console.error(error);
      });
   } else {
    console.log('No network');
    this.setState({
      connected:false
    });
   }
});
}

showAlert(){
     showMessage({
              message: errorMsg,
              type: "info",
              animationDuration:"500",
              duration: 2550
            });
}

render() {
  if (this.state.dataLoaded==false){
    return (
      <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
          <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
            {(this.state.connected==true)?
            <Text style={{fontSize:20, color:'#FB9203'}}>Loading ......</Text>
            :
            <Text style={{fontSize:20, color:'#FB9203'}}>No Network</Text>
            }
          </View>
      </View>
    );
  }else {
      return (
        <View style={styles.container}>


        <TextInput style={{height: 40, borderColor: 'gray', borderWidth: 1, width:'90%', marginLeft:'5%', borderRadius:5, marginTop:'2%', marginBottom:'2%', paddingLeft:'2%'}} 
          onChange={(searchText) => this.setSearchText(searchText)} placeholderTextColor='#D6D5D3'
        underlineColorAndroid='transparent' placeholder={'Enter Text to search'}/>

       
          <ListView
            dataSource={this.state.dataSource}
            enableEmptySections={true}
            refreshControl={
            <RefreshControl 
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          renderRow={(rowData) => 
              <TouchableOpacity style={{width:'100%', paddingLeft:'5%', paddingRight:'5%'}} onPress={()=>{this.productOrderPage(rowData)}}>
                <View style={{justifyContent:'space-between', flexDirection:'row'}}>
                  <View style={{width:'90%'}}>
                    <Text style={{fontSize:15, color: '#FB9203', flexWrap: 'wrap'}}>{rowData.name}</Text>
                    <Text style={{}}>{rowData.pho}</Text>
                  </View>

                  <View style={{justifyContent:'center', }}>
                    <Icon name="chevron-right" size={px2dp(20)} color="#FB9203"/>
                  </View>
                </View>

                <View style={{height:1, width:'90%', backgroundColor:'#E8E5E2', marginBottom:'2%', marginTop:'1%', alignItems:'center'}}/>
              </TouchableOpacity>
            }
          />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:'white',
    flex: 1,
    paddingBottom:'2%'

  }
});
