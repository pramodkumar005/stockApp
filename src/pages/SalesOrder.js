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
  FlatList
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import { filter, indexOf, invert, findKey } from 'lodash';
import { Dropdown } from 'react-native-material-dropdown';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { showMessage, hideMessage } from "react-native-flash-message";

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var partyArray=[];
var productArray=[];
// var orderArray=[{key: 'a', product:'a1', rate:'a2', quantity:'a3', amount:'a4'}, {key: 'b', product:'b1', rate:'b2', quantity:'b3', amount:'b4' }];

var errorMsg = '';
var currentDate ='';
var timestamp ='';

export default class SalesOrder extends Component<{}> {
  constructor()
    {
        super();
        this.state = { 
          partyName:'',
          productName:'',
          customercode:'',
          productRate:'',
          totalAmount:'',
          quantity:'',
          productId:'',
          animation:false,
          dataLoaded: false,
          companyId:'',
          orderArray:[]
        }
    this.fetchFunction = this.fetchFunction.bind(this);
    this.fetchFunction2 = this.fetchFunction2.bind(this);
    this.showAlert = this.showAlert.bind(this);
   // this.setSearchText = this.setSearchText.bind(this);
    //this.onPressRow = this.onPressRow.bind(this);
   // this.fetchFunction();
   // this.fetchFunction2();
    
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
        },()=>{this.fetchFunction();
               this.fetchFunction2()
             })
      }else{
        console.log('No result >>>> ');
      }
    }); 

    // Calculate date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = yyyy + '/' + mm + '/' + dd;
    currentDate = today;
    
}

showPopup(){
//Actions.addrecord();
this.popupDialog.show();
}

componentDidMount() {
NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
}

componentWillUnmount() {
  NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
}

_handleConnectionChange = (isConnected) => {
  console.log('Network state:::'+this.state.connected);
    this.setState({connected:isConnected});
    if(isConnected==true){
      this.fetchFunction();
      this.fetchFunction2();
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
    fetch(global.outstandingUrl+this.state.companyId.slice(1,-1), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {
        console.log('Outstanding List loaded successfully>>>>>>>>>>>>');
         //console.log(responseJson.tablesDetails);
         this.setState({
          dataSource: ds.cloneWithRows(responseJson.tablesDetails),
          data2: responseJson.tablesDetails,
         });
         console.log('Response data length>>>>>'+responseJson.tablesDetails.length);
         for(let i=0; i<responseJson.tablesDetails.length; i++){
          //console.log(this.state.data2[i].customercode);
          partyArray.push({value:this.state.data2[i].name, customercode:this.state.data2[i].customercode});
         }
         //console.log('Array Length>>>'+partyArray);
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




fetchFunction2(){
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
        console.log('Product list loaded successfully>>>>>>>>>>>>');
         //console.log(responseJson.tablesDetails);
         this.setState({
          dataSource: ds.cloneWithRows(responseJson.tablesDetails),
          data3: responseJson.tablesDetails,
          dataLoaded: true
         });

         for(let i=0; i<responseJson.tablesDetails.length; i++){
          productArray.push({value:this.state.data3[i].pat, rate:this.state.data3[i].rate, productId:this.state.data3[i].id});
         }
         //console.log('Array Length>>>'+productArray.length);
         
      })
     .catch((error) => {
        console.error(error);
      });
    } else {
      console.log('No network');
       this.setState({
        connected: false
      });
      errorMsg= "No Network";
      this.showAlert();
    }
});
}


addEntry(){
  this.setState({
              errorAllfield:false
            })
  console.log(this.state.orderArray);
  console.log('this.state.totalAmount>>>>'+this.state.totalAmount);
  console.log('this.state.customercode>>>>'+this.state.customercode);
  console.log('this.state.partyName>>>>'+this.state.partyName);
  console.log('this.state.productId>>>>'+this.state.productId);
  console.log('this.state.productName>>>>'+this.state.productName);
  console.log('this.state.quantity>>>>'+this.state.quantity);
  console.log('this.state.rate>>>>'+this.state.productRate);

  if(this.state.partyName==''| this.state.productName=='' | this.state.productRate=='' | this.state.totalAmount==''){
            errorMsg = 'All fields are mandatory';
            this.setState({
              errorAllfield:true
            })
    }else{


  timestamp = new Date().getUTCMilliseconds();
    console.log('time stiamp>>>>>>>>>>>>>>>>>>'+timestamp);



  var entry ={key: timestamp, cid:this.state.customercode, cust_name: this.state.partyName, pid:this.state.productId, prod_name:this.state.productName, rate:this.state.productRate, qty:this.state.quantity, amount:this.state.totalAmount, ord_no:'', ord_date: currentDate};
  
  var tempArray=this.state.orderArray;

  tempArray.push(entry);

  this.setState({
    orderArray: tempArray,
    totalAmount:'',
    partyName:'',
    productId:'',
    productName:'',
    quantity:'',
    productRate:'',
    customercode:'',
  },()=>{console.log(this.state.orderArray)});

  tempArray = [];
  

  //console.log(this.state.orderArray);
  this.popupDialog.dismiss();
  }
}


fetchPostFunction(){
  console.log('this.state.totalAmount>>>>'+this.state.totalAmount);
  console.log('this.state.customercode>>>>'+this.state.customercode);
  console.log('this.state.partyName>>>>'+this.state.partyName);
  console.log('this.state.productId>>>>'+this.state.productId);
  console.log('this.state.productName>>>>'+this.state.productName);
  console.log('this.state.quantity>>>>'+this.state.quantity);
  console.log('this.state.rate>>>>'+this.state.productRate);

  console.log(this.state.orderArray);

    if(this.state.connected==true){
           console.log('URL>>>>>>>>>>>>'+global.salesOrder+this.state.companyId.slice(1,-1));

            this.setState({
                animation: true
              });
            Keyboard.dismiss();
            fetch(global.salesOrder+this.state.companyId.slice(1,-1), {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.state.orderArray),
          })
          .then((response) => response.json())
              .then((responseJson) => {
                 console.log(responseJson.responsecode);
                 if(responseJson.responsecode==200){
                    errorMsg= "Sales order added successfully !!";
                    this.setState({
                      animation:false,
                      orderArray:[]
                    });
                    console.log('>>>>>>data send successfully');

                   this.showAlert();
                 }else{
                    errorMsg= "Error in adding Sales order !!";
                    console.log('>>>>>>data not send successfully');
                    this.showAlert();
                 }
              })
             .catch((error) => {
                console.error(error);
                this.setState({
                  animation: false
                })
              });
      }else{
    console.log('Network state:::'+this.state.connected);
    errorMsg= "No Network";
    this.showAlert();
  }

}

partyValueChangeText(text, index, data){
  //console.log("Text::"+text + "::" + index +":: " + data[index].customercode);
  this.setState({
    partyName: text,
    customercode: data[index].customercode
  })

}

productValueChangeText(text, index, data){
  console.log("Text::"+text + "::" + index +":: " + data[index].rate+ "::"+ data[index].productId);
  this.setState({
    productName: text,
    productRate: data[index].rate,
    productId:  data[index].productId
  })

}

render() {
  let data = partyArray;
  let data2 = productArray;

    return (
      <View style={styles.container}>
        { (this.state.dataLoaded==false)?
          <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
            {(this.state.connected==true)?
            <Text style={{color: "#FB9203", fontSize:20}}>Fetching data.....</Text>
            :  
            <Text style={{color: "#FB9203", fontSize:20}}>No Network</Text>
            }
          </View>
          :
        <View style={{flex:1, paddingLeft:'5%', paddingRight:'5%', paddingBottom:'10%'}}>
          <View style={{width:'100%',height:'10%', alignItems:'flex-end'}}>
            <TouchableOpacity style={styles.button} onPress={()=>{this.showPopup()}}>
              <Text style={{color:'white'}}>Add Record</Text>
            </TouchableOpacity>
          </View>
          <View style={{}}>
            <FlatList
              data={this.state.orderArray}
              extraData={this.state}
              renderItem={({item}) => 
              <View style={{marginTop:'2%'}}>
                <Text style={{ fontSize:15, color: '#FB9203'}}>{item.cust_name}</Text>

                <View style={{flexDirection: 'row'}}>
                  <Text style={{}}>Product: </Text>
                  <Text style={{}}>{item.prod_name}</Text>
                </View>

                <View  style={{flexDirection: 'row'}}>
                  <Text style={{}}>Rate: </Text>
                  <Text style={{}}>{item.rate}</Text>
                </View>

                <View style={{flexDirection: 'row'}}>
                  <Text style={{}}>Quantity: </Text>
                  <Text style={{}}>{item.qty}</Text>
                </View>

                <View  style={{flexDirection: 'row'}}>
                  <Text style={{}}>Total Amount: </Text>
                  <Text style={{}}>{item.amount}</Text>
                </View>

                <View  style={{flexDirection: 'row'}}>
                  <Text style={{}}>Order Date: </Text>
                  <Text style={{}}>{item.ord_date}</Text>
                </View>
                <View style={{height:1, width:'100%', backgroundColor:'#BFC2C2', marginTop:'2%'}}/>
              </View>

              }
            />
          </View>
          <View style={{height:'10%', width:'100%'}}>
              {(this.state.orderArray.length !== 0)?
              <TouchableOpacity style={styles.button} onPress={()=>{this.fetchPostFunction()}}>
                    <Text style={{color:'white'}}>Save</Text>
              </TouchableOpacity>:
              null
              }
            </View>  


        <PopupDialog
              width={0.9}
              height= {0.8}
              dismissOnHardwareBackPress = {true}
              ref={(popupDialog) => { this.popupDialog = popupDialog; }}
              dialogTitle={<DialogTitle title="Details" />}
              dialogStyle={{marginTop:-130}}
              >
              <ScrollView contentContainerStyle={{flex:1, marginLeft:'5%', marginRight:'5%', paddingBottom:'10%'}}>
                      <Dropdown label='PARTY' labelFontSize={14} baseColor={'#FB9203'} value= {this.state.partyName} data={data} onChangeText={this.partyValueChangeText.bind(this)} itemCount={8}/>

                      <Dropdown label='PRODUCT' labelFontSize={14} baseColor={'#FB9203'}  data={data2} value= {this.state.productName} onChangeText={this.productValueChangeText.bind(this)} itemCount={8}/>

                      <Text style={{color:'#FB9203', marginTop:'2%'}}>RATE</Text>
                       <TextInput style={styles.textInput} onChangeText={(text) => this.setState({productRate: text})}
                        value={"Rs."+this.state.productRate} underlineColorAndroid='transparent' placeholder='Rate' placeholderTextColor='#D6D5D3'/>

                        <Text style={{color:'#FB9203'}}>QUANTITY</Text>
                        <TextInput style={styles.textInput} onChangeText={(text) => {
                            var sum = parseFloat(this.state.productRate * text).toFixed(2);
                            this.setState({
                              quantity: text,
                              totalAmount: sum
                            })
                          }}
                        value={this.state.quantity} underlineColorAndroid='transparent' placeholder='Rate' placeholderTextColor='#D6D5D3'/>
                        <Text style={{color:'#FB9203'}}>AMOUNT</Text>
                        <TextInput style={styles.textInput} onChangeText={(text) => this.setState({totalAmount: text})}
                          value={"Rs."+this.state.totalAmount} underlineColorAndroid='transparent' placeholder='Rate' placeholderTextColor='#D6D5D3'/>
                          <View style={{width:'100%',height:'10%', alignItems:'center', flexDirection:'row'}}>
                              <TouchableOpacity style={[styles.button]} onPress={()=>{this.addEntry()}}>
                                <Text style={{color:'white'}}>Add</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={[styles.button2,{marginLeft:'2%'}]} onPress={()=>{this.popupDialog.dismiss()}}>
                                <Text style={{color:'#FB9203'}}>Cancel</Text>
                              </TouchableOpacity>
                        </View>
                        {(this.state.errorAllfield==true)?
                           <Text style={{color:'red', marginTop:'2%'}}>All fields are manadatory</Text>
                           :
                           null
                        }

                </ScrollView>
          </PopupDialog>

        </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  button:{
    justifyContent:'center', 
    alignItems:'center', 
    width:'25%', 
    borderColor:'#FB9203', 
    height:'80%', 
    marginTop:'2%', 
    borderRadius:5,
    borderWidth:1,
    backgroundColor: '#FB9203'
  },
  button2:{
    justifyContent:'center', 
    alignItems:'center', 
    width:'25%', 
    borderColor:'#FB9203', 
    height:'80%', 
    marginTop:'2%', 
    borderRadius:5,
    borderWidth:1,
    backgroundColor: 'white'
  },
  textInput:{height: 40, borderColor: '#D6D5D3', borderWidth: 1, borderRadius:5, paddingLeft:'2%', marginTop:'2%', marginBottom:'5%'}
});
