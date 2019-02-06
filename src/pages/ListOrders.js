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
  AsyncStorage,
  RefreshControl,
  Alert
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { filter, indexOf, invert, findKey } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Dimensions} from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";



const deviceW = Dimensions.get('window').width
const basePx = 375
function px2dp(px) {
  return px *  deviceW / basePx
}
var errorMsg = '';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});

export default class ListOrders extends Component<{}> {
  constructor()
    {
        super();
        this.state = { 
          dataSource:ds.cloneWithRows(['']),
          dataLoaded: false,
          searchText:'',
          companyId:'',
          refreshing: false,
          dataSource2:ds.cloneWithRows(['No data','No data'])
        }
    this.fetchFunction = this.fetchFunction.bind(this);
    this.setSearchText = this.setSearchText.bind(this);
    this.onPressRow = this.onPressRow.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.fetchExport = this.fetchExport.bind(this);
    //this.fetchFunction();
    this.arrayholder = [] ;
    console.log('data source length>>>>>>>'+this.state.dataSource.length);

    }


componentWillMount() {

AsyncStorage.getItem('@Role:key', (err, result) => {
      console.log('Result>>>>>>>>>>>>>>>'+result);
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
          })
        }
      }
    });


  NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
    });
  
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



showAlert(){
     showMessage({
              message: errorMsg,
              type: "info",
            });
}

fetchFunction(){

NetInfo.isConnected.fetch().then(isConnected =>{
    console.log('Connection status::'+isConnected);
    if(isConnected==true) {  
    this.setState({connected:true}); 
    fetch(global.salesOrderList+this.state.companyId.slice(1,-1), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {
         console.log(responseJson.tablesDetails);
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

deleteConfirmation(rowData){
    Alert.alert(
    'CONFIRM',
    'Are you sure want to delete this order ?',
    [
      {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'destructive'},
      {text: 'OK', onPress: () => {this.deleteFunction(rowData)}},
    ],
    { cancelable: false }
  )
}

deleteFunction(rowData){
  console.log(rowData)
console.log('url>>>>>>>>'+global.orderDelete+this.state.companyId.slice(1,-1)+'&id='+rowData.id);
NetInfo.isConnected.fetch().then(isConnected =>{
    console.log('Connection status::'+isConnected);
    if(isConnected==true) {  
    this.setState({connected:true}); 
    fetch(global.orderDelete+this.state.companyId.slice(1,-1)+'&id='+rowData.id, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.fetchFunction();
        errorMsg= "Record Deleted Successfully..!!";
        this.showAlert();
      })
     .catch((error) => {
        console.error(error);
      });
   } else {
    console.log('No network');
    this.setState({
      connected:false
    });
    errorMsg= "No Network";
    this.showAlert();
   }
});
}


onPressRow(rowData){
  this.popupDialog.show(() => {
    this.setState({
      orderNumber:rowData.ord_no,
      OrderDate:rowData.ord_date,
      customerId:rowData.cid,
      customerName:rowData.cust_name,
      productId:rowData.pid,
      productName:rowData.prod_name,
      quantity:rowData.qty,
      rate:rowData.rate,
      amount:rowData.amount
    })
  });
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
         console.log(":::::"+n.cust_name);
        let note = n.cust_name.toLowerCase();
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
    errorMsg= "No Network";
    this.showAlert();
  }
}

renderCondition=()=>{
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
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(rowData) => 
            <TouchableOpacity onPress={()=>{this.onPressRow(rowData)}}>
              <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                  <View style={{width:'90%'}}>
                    <Text style={{flex:1,paddingLeft:'3%', fontSize:15, color: '#FB9203', flexWrap: 'wrap'}} number={1}>{rowData.cust_name}</Text>
                    <Text style={{paddingLeft:'3%', color: '#FB9203'}}>Order No.: #{rowData.ord_no}</Text>
                    <Text style={{paddingLeft:'3%'}}>Product: {rowData.prod_name}</Text>
                    <Text style={{paddingLeft:'3%'}}>Amount: {rowData.amount}</Text>
                    <Text style={{paddingLeft:'3%'}}>Placed On: {rowData.ord_date}</Text>
                  </View>
                  <TouchableOpacity style={{marginRight:'5%', justifyContent:'center'}} onPress={()=>{this.deleteConfirmation(rowData)}}>
                    <Icon name="trash" size={px2dp(25)} color="#FB9203"/>
                  </TouchableOpacity>
                </View>
              <View style={{height:1, width:'100%', backgroundColor:'#E8E5E2', marginBottom:'2%', marginTop:'1%'}}/>
              
            </TouchableOpacity>
          } />


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
          
          <TouchableOpacity style={{marginRight:'5%', backgroundColor:'#6D9E54', paddingLeft:10, paddingRight:10, paddingBottom:3, paddingTop:3, borderRadius:5, justifyContent:'center', alignItems:'center'}} onPress={()=>{this.fetchExport()}}>
            <Icon name="upload" size={px2dp(15)} color="white"/>
            <Text style={{color:'white', fontSize:9}}>Export</Text>
          </TouchableOpacity>
          
        </View>
        {this.renderCondition()}
         <PopupDialog
           dialogAnimation={slideAnimation}
              width={0.9}
              height= {0.6}
              dismissOnHardwareBackPress = {false}
              ref={(popupDialog) => { this.popupDialog = popupDialog; }}
              dismissOnHardwareBackPress = {true}              
              dialogTitle={<DialogTitle title="Details" />}              
              dialogStyle={{marginTop:-150}}
              >
              <View style={{width:'80%', marginTop:'2%', height:'100%'}}>
                <Text style={{marginLeft:'5%', color:'#FB9203'}}>Order Number:</Text>
                <Text style={{marginLeft:'5%'}}>#{this.state.orderNumber}</Text>
                <Text style={{marginLeft:'5%', color:'#FB9203'}}>Name:</Text>
                <Text style={{marginLeft:'5%'}}>{this.state.customerName}</Text>
                <Text style={{marginLeft:'5%', marginTop:'2%', color:'#FB9203'}}>Product:</Text>
                <Text style={{marginLeft:'5%'}}>{this.state.productName}</Text>
                <View style={{flexDirection:'row', alignItems:'center', marginTop:'2%', width:'100%'}}>
                  <Text style={{marginLeft:'5%', color:'#FB9203'}}>Quantity:</Text>
                  <Text style={{marginLeft:'1%'}}>{this.state.quantity}</Text>
                  <Text style={{marginLeft:'5%', color:'#FB9203', marginLeft:'3%'}}>Rate:</Text>
                  <Text style={{marginLeft:'1%'}}>Rs {this.state.rate}</Text>
                </View>
                <Text style={{marginLeft:'5%', marginTop:'2%', color:'#FB9203'}}>Amount:</Text>
                <Text style={{marginLeft:'5%'}}>Rs {this.state.amount}</Text>  
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
    height:'10%', 
    marginTop:'5%', 
    borderRadius:5,
    borderWidth:1,
    marginLeft: '40%'

  }
});
