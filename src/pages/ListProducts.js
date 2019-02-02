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
  AsyncStorage,
  RefreshControl
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { filter, indexOf, invert, findKey } from 'lodash';
import {Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showMessage, hideMessage } from "react-native-flash-message";


var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});

var errorMsg = '';

const deviceW = Dimensions.get('window').width
const basePx = 375
function px2dp(px) {
  return px *  deviceW / basePx
}


export default class ListProducts extends Component<{}> {
  constructor()
    {
        super();
        this.state = { 
          dataSource:ds.cloneWithRows(['']),
          dataLoaded: false,
          searchText:'' ,
          companyId:'',
          refreshing: false,
          total:'0.00'  
        }
    this.fetchFunction = this.fetchFunction.bind(this);
    this.onPressRow = this.onPressRow.bind(this);
    this.fetchSync = this.fetchSync.bind(this);
    //this.fetchFunction();
    }


componentDidMount() {
NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);

}

componentWillMount(){
  NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
    });
  
   AsyncStorage.getItem('@MyCompanyId:key', (err, result) => {
      console.log('Result>>>>>>>>>>>>>>>'+result);
      if (result!==null) {
        console.log('Result::'+result);
        this.setState({
          companyId:result
        },()=>{
        console.log("companyId::"+this.state.companyId); 
        this.fetchFunction();
      })
      }else{
        console.log('No result >>>> ');
      }
    }); 
}

componentWillUnmount() {
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
         console.log(":::::"+n.pat);
        let note = n.pat.toLowerCase();
        return note.search(text) !== -1;
      });
    }

fetchFunction(){
  console.log('Fetching>>>>>>>>>>>>>>>>>>>>'+global.productUrl+this.state.companyId);
  NetInfo.isConnected.fetch().then(isConnected =>{
    if(isConnected==true) { 
      this.setState({
        connected: true
      });
    fetch(global.productUrl+this.state.companyId.slice(1,-1), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {
         //console.log(responseJson.tablesDetails);
         this.setState({
          dataSource: ds.cloneWithRows(responseJson.tablesDetails),
          data: responseJson.tablesDetails,
          dataLoaded: true,
          refreshing: false,
          total: Number.parseFloat(responseJson.cur_bal).toFixed(2)
         });
         console.log('Product Data >>>>>>>>'+ JSON.stringify(this.state.dataSource));
      })
     .catch((error) => {
        console.error(error);
      });
    } else {
      console.log('No network');
       this.setState({
        connected: false
      });
    }
});
}


fetchSync(){
console.log('Fetching sync>>>>>>>>>>>>>>>>>>>>'+global.syncProduct+ this.state.companyId.slice(1,-1));
let compID =  this.state.companyId.slice(1,-1);
console.log('Connection status::' + compID);
NetInfo.isConnected.fetch().then(isConnected =>{

    console.log('Connection status::'+isConnected +"::" + compID);
    if(isConnected==true) {  
    this.setState({connected:true}); 
    fetch(global.syncProduct+compID, {
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
          errorMsg = 'Updated the list successfully'
          this.showAlert();

         }else{
          console.log('responsecode is not 200');
          errorMsg = 'No new data to update'
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


onPressRow(rowData){
  //console.log(rowData.id);
  this.popupDialog.show(() => {
    this.setState({
      pat:rowData.pat,
      mrp:rowData.mrp,
      rate:rowData.rate,
      cur_stk:rowData.cur_stk,
      cur_val:rowData.cur_val
    })
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


showAlert(){
     showMessage({
              message: errorMsg,
              type: "info",
              animationDuration:"500",
              duration: 2550
            });
}

renderCondition=()=>{
  if (this.state.dataLoaded==false){
    return (
      <View style={[styles.container,{justifyContent:'center', alignItems:'center'}]}>
          <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
            {(this.state.connected==true)?
            <Text style={{fontSize:20, color:'#FB9203'}}>Loading ......</Text>
            :
            <Text style={{fontSize:20, color:'#FB9203'}}>No Network</Text>
            }
          </View>
      </View>
    );
  }else{

    return (
        <View style={{marginLeft:'2%', marginRight:'2%', paddingBottom:'2%', height:'100%'}}>
         <ListView
         style={{marginBottom:'10%'}}
         refreshControl={
            <RefreshControl 
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
         style={{marginBottom:'10%'}}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(rowData) => 
            <TouchableOpacity onPress={()=>{this.onPressRow(rowData)}} style={{width:'95%'}}>
              <Text style={{paddingLeft:'3%', fontSize:15, color: '#FB9203'}}>{rowData.pat}</Text>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <View>
                  <Text style={{paddingLeft:'3%'}}>Total Value:</Text>
                </View>
                <View>
                  <Text style={{paddingLeft:'3%'}}>{Number.parseFloat(rowData.cur_val).toFixed(2)}</Text>
                </View>
              </View>
              <View style={{height:1, width:'100%', backgroundColor:'#E8E5E2', marginBottom:'2%', marginTop:'1%'}}/>
            </TouchableOpacity>
          } />
          <View style={{width:125, height:50, backgroundColor:'#FB9203', position:'absolute', right:0, bottom:'12%', borderRadius:5, justifyContent:'center', alignItems:'center',padding:5}}>
            <Text style={{color:'white'}}>Total: </Text>
            <Text style={{color:'white'}}><Icon name="rupee" size={px2dp(12)} color="white"/> {this.state.total}</Text>
          </View>
        </View>
    );
  }
}

render() {
    return (
      <View style={styles.container}>
        <View style={{justifyContent:'space-between', flexDirection:'row', alignItems:'center'}}>
          <View style={{width:'80%'}}>
            <TextInput style={{height: 40, borderColor: 'gray', borderWidth: 1, width:'90%', marginLeft:'5%', borderRadius:5, marginTop:'2%', marginBottom:'2%', paddingLeft:'2%'}} 
              onChange={(searchText) => this.setSearchText(searchText)} placeholderTextColor='#D6D5D3'
            underlineColorAndroid='transparent' placeholder={'Enter Text to search'}/>
          </View>
          <TouchableOpacity style={{marginRight:'5%', backgroundColor:'#FB9203', paddingLeft:10, paddingRight:10, paddingBottom:3, paddingTop:3, borderRadius:5, justifyContent:'center', alignItems:'center'}} onPress={()=>{this.fetchSync()}}>
            <Icon name="retweet" size={px2dp(15)} color="white"/>
            <Text style={{color:'white', fontSize:9}}>Sync</Text>
          </TouchableOpacity>
        </View>
        {this.renderCondition()}
         <PopupDialog
           dialogAnimation={slideAnimation}
              height= {0.7}
              width={0.9}
              dialogStyle={{marginTop:-175}}
              dismissOnHardwareBackPress = {true}              
              dialogTitle={<DialogTitle title="Details" />}
              dismissOnHardwareBackPress = {true}
              ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
              <View style={{width:'80%', marginTop:'2%'}}>
                <Text style={{marginLeft:'5%', color:'#FB9203'}}>Product:</Text>
                <Text style={{marginLeft:'5%'}}>{this.state.pat}</Text>
                <Text style={{marginLeft:'5%', marginTop:'2%', color:'#FB9203'}}>MRP:</Text>
                <Text style={{marginLeft:'5%'}}>{this.state.mrp}</Text>
                <Text style={{marginLeft:'5%', marginTop:'2%', color:'#FB9203'}}>Rate:</Text>
                <Text style={{marginLeft:'5%'}}>{this.state.rate}</Text>
                <Text style={{marginLeft:'5%', marginTop:'2%', color:'#FB9203'}}>Stock:</Text>
                <Text style={{marginLeft:'5%'}}>{this.state.cur_stk}</Text>
                <Text style={{marginLeft:'5%', marginTop:'2%', color:'#FB9203'}}>Total Value:</Text>
                <Text style={{marginLeft:'5%'}}>{Number.parseFloat(this.state.cur_val).toFixed(2)}</Text>
                <TouchableOpacity style={styles.button} onPress={()=>{this.popupDialog.dismiss()}}>
                  <Text style={{color:'#FB9203'}}>Close</Text>
                </TouchableOpacity>                                              
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
    width:'50%', 
    borderColor:'#FB9203', 
    height:'15%', 
    marginTop:'5%', 
    borderRadius:5,
    borderWidth:1,
    marginLeft: '40%'

  }
});
