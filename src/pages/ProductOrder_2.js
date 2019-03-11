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
  RefreshControl,
  BackHandler
} from 'react-native';
import {Actions} from 'react-native-router-flux';

import RNHTMLtoPDF   from 'react-native-html-to-pdf';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import { filter, indexOf, invert, findKey } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dropdown } from 'react-native-material-dropdown';
import {Dimensions} from 'react-native';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { Picker, DatePicker } from 'react-native-wheel-datepicker';
import ActionButton from 'react-native-action-button';
import { showMessage, hideMessage } from "react-native-flash-message";
import { Table, Row, Rows } from 'react-native-table-component';
import Share, {ShareSheet, Button} from 'react-native-share';

const deviceW = Dimensions.get('window').width
const basePx = 375
function px2dp(px) {
  return px *  deviceW / basePx
}

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

var partyArray=[];
var productArray=[];
var errorMsg='';
var pdfshowData= [];
var todayDate='';
var pdfContent='';

export default class ProductOrder_2 extends Component<{}> {
  constructor(props)
    {
        super();
        this.state = { 
           companyId:'',
           dataSource:ds.cloneWithRows(['']),
           data:'',
           dataLoaded: false,
           refreshing: false,
           totalAmount: '',
           hideButton: false,
           placingOrder: false,
           quantity:'',
           customercode: props.customerDetails.customercode,
           customerName: props.customerDetails.name,
           orderArray: [],
           tempDatasource: ds.cloneWithRows([]),
           tableHead: ['Description', 'Qty', 'Rate', 'Amount'],
           tableData: [
            ['1', '2', '3', '4'],
            ['a', 'b', 'c', 'd'],
            ['1', '2', '3', '456\n789'],
            ['a', 'b', 'c', 'd']
          ]
        }
    this.fetchFunction = this.fetchFunction.bind(this);
    this.setSearchText = this.setSearchText.bind(this);
    this.quantitySelector = this.quantitySelector.bind(this);
    this.orderPreview = this.orderPreview.bind(this);
    this.postFunction = this.postFunction.bind(this);
    this.back = this.back.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.deleteRow = this.deleteRow.bind(this);

    console.log('Customer Details:>>>'+ props.customerDetails.customercode);
    console.log('Customer Details:>>>'+ props.customerDetails.name);   

    var date = new Date();
    todayDate =  date.getDate() +'-'+date.getMonth()+'-'+date.getFullYear(); 

  }


handleBackPress = () => {
  console.log('I am in back action products....');
  Actions.dashboard({'lastPage':'productOrder_2'});
  return true;

}

componentWillMount(){

  NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
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
    this.setState({
      ord_date: currentDate
    })
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress.bind(this));
}

componentDidMount() {
NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  AsyncStorage.getItem('@MyCompanyId:key', (err, result) => {
      //console.log('Result>>>>>>>>>>>>>>>'+result);
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
      this.setState({
        hideButton: false
      })
    }else{
      this.setState({
        hideButton: true
      })
      console.log('Connection change>>>>>no network');
    }
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress.bind(this));
  };



fetchFunction(){
console.log('Fetching>>>>>>>>>>>>>>>>>>>>'+global.productUrl+this.state.companyId);
  let compID =  this.state.companyId.slice(1,-1);
  console.log('Connection status::' + compID);
  NetInfo.isConnected.fetch().then(isConnected =>{

      console.log('Connection status::'+isConnected +"::" + compID);
      if(isConnected==true) {  
      this.setState({connected:true}); 
       fetch(global.productUrl+this.state.companyId.slice(1,-1), {
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

addEntry(){
  console.log('quantity>>>>>>.'+this.state.quantity);
  if(this.state.quantity==''){
    this.popupDialog.dismiss();
    errorMsg= "Quantity cannot be blank";
    this.showAlert();
    console.log('Quantity cannot be blank');
  }else{
    Keyboard.dismiss();
    var  calAmount = (this.state.quantity * this.state.rate);
    var amount = calAmount.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    console.log('Total amount calculated::'+ amount);
    this.setState({
      totalAmount: amount
    }, () => {
    this.popupDialog.dismiss();
    var entry ={cid:this.state.customercode, cust_name: this.state.customerName, pid:this.state.productId, prod_name:this.state.productName, rate:this.state.rate, qty:this.state.quantity, amount:this.state.totalAmount, ord_no:'', ord_date: currentDate};

    var tempArray = this.state.orderArray;

    tempArray.push(entry);

     this.setState({
        orderArray: tempArray,
        tempDatasource: ds.cloneWithRows(tempArray),
        pdfArray:tempArray
     },()=>{console.log(this.state.orderArray)})

    tempArray = [];

    console.log('amount>>>>>>'+this.state.amount);
    errorMsg= "Order added to cart";
    this.showAlert();
    })
  }

}




showAlert(){
    showMessage({
              message: errorMsg,
              type: "info",
            });
    animationDuration: 300
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
      return filter(notes,(n) => {
         //console.log(":::::"+n.pat);
        let note = n.pat.toLowerCase();
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

orderPreview(){
  this.popupDialog2.show();
}

quantitySelector(rowData){
  console.log('rowData>>>>>>>>>>>>>>>>>>>>>>>>>>>'+ JSON.stringify(rowData));

  this.popupDialog.show(() => {

  //console.log('callback - will be called immediately')
  });
  this.setState({
    productName: rowData.pat,
    productId: rowData.id,
    rate: rowData.rate
  },()=>{console.log('Rate set >>>>>>>>>>>>>'+this.state.rate)});

}


generatePDF(){
  pdfshowData = [];
  var pdfTable =[];
  var amountTotal ='';
  console.log('tempData>>>>>>>>>>'+JSON.stringify(this.state.pdfArray.length));
  for (var i = 0; i < this.state.pdfArray.length; i++) {
     // console.log("prod name>>>>>>"+ JSON.stringify(this.state.pdfArray[i].cid));
    pdfTable = pdfTable + '<tr style="text-align:right"><td style="padding-left: 5px">'+ this.state.pdfArray[i].prod_name+ '</td><td style="padding-left: 5px">'+ this.state.pdfArray[i].qty +'</td><td style="padding-left: 5px">'+ this.state.pdfArray[i].rate+ '</td><td style="padding-left: 5px">' + this.state.pdfArray[i].rate * this.state.pdfArray[i].qty+ '</td></tr>';
    amountTotal = Number(amountTotal) + Number(this.state.pdfArray[i].amount);
  }


  for (var i = 0; i < this.state.pdfArray.length; i++) {
     // console.log("prod name>>>>>>"+ JSON.stringify(this.state.pdfArray[i].cid));
     tempPdfshowData =[];
     var product = this.state.pdfArray[i].prod_name;
     tempPdfshowData.push(product);
     var qty =  this.state.pdfArray[i].qty;
     tempPdfshowData.push(qty);
     var rate = this.state.pdfArray[i].rate;
     tempPdfshowData.push(rate);
     var amount = this.state.pdfArray[i].rate * this.state.pdfArray[i].qty;
     tempPdfshowData.push(amount.toFixed(2));
     pdfshowData.push(tempPdfshowData);
  }

    var lastrow = ['item(s): '+this.state.pdfArray.length, ' ','Total:', amountTotal];
    pdfshowData.push(lastrow);

    console.log('Array >>>>>>>>>>>>>>>>>>>>>>>>.'+pdfshowData);

    this.setState({
      pdfRowData : pdfshowData
    })

  var pdfTop = '<div style="padding: 5;width: 100px;border-bottom: 1px solid;margin-bottom: 10px;"><span>ORDER SLIP</span></div>';

  var pdfDate = '<div style="margin-bottom:10px"><span>Date:' + todayDate + '</span></div> <table style="border-bottom: 1px solid">';

  var pdfTableHeader = '<tr style="text-align: right; background: #dedbdb"> <th style="padding-left: 10px">Description</th> <th style="padding-left: 10px">Qty</th> <th style="padding-left: 10px">Rate</th> <th style="padding-left: 10px">Amount</th>  </tr>';

  var pdfFotter = '<tr  style="text-align:right"> <td style="border-top: 1px solid;">Item(s): '+this.state.pdfArray.length +'</td> <td style="border-top: 1px solid;"></td> <td style="border-top: 1px solid;">Total</td> <td style="border-top: 1px solid;font-size: 24px;font-weight: bold;">'+ amountTotal.toFixed(2) +'</td>  </tr></table>'

  console.log("amountTotal name>>>>>>"+ pdfTop + pdfDate + pdfTableHeader+pdfTable +pdfFotter);

  pdfContent = pdfTop + pdfDate + pdfTableHeader+pdfTable +pdfFotter;

  this.popupDialog3.show();
}


print(){
  let options = {
      html: pdfContent,
      fileName: 'Reciept',
      directory: 'Documents',
      height: 800,
      width: 1056,
      padding: 24,
      base64: true
    };

  RNHTMLtoPDF.convert(options).then(fileData => {
      console.log('>>>>>>>>>>>>>>>>>>>33333333333333333333');
      console.log('PDF generated', fileData);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.');
      console.log(fileData.base64); 
      console.log(fileData.filePath);

      Share.open({
        title: "Order Slip",
        // message: "I just wanted to show you this:",
        url: "data:application/pdf;base64," + fileData.base64,
        subject: "Order Slip",
      });
    });
}



postFunction(){
    console.log(this.state.orderArray);
    this.popupDialog.dismiss();

    if(this.state.connected==true){
           console.log('URL>>>>>>>>>>>>'+global.salesOrder+this.state.companyId.slice(1,-1));

            this.setState({
              placingOrder:true
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
                      orderArray:[],
                      tempDatasource: ds.cloneWithRows([]),
                      placingOrder:false
                    });
                    this.popupDialog2.dismiss();
                    console.log('>>>>>>data send successfully');
                    this.showAlert();
                    this.generatePDF();
                 }else{
                    this.popupDialog2.dismiss();
                    this.showAlert();
                    errorMsg= "Error in adding Sales order !!";
                    console.log('>>>>>>data not send successfully');
                 }
              })
             .catch((error) => {
                console.error(error);
                this.setState({
                  placingOrder:false
                })
              });
      }else{
    console.log('Network state:::'+this.state.connected);
    errorMsg= "No Network";
    this.setState({
      hideButton: true
    });
    this.showAlert();
  }
  
}

deleteRow(rowID){
  console.log('rowID>>>>'+rowID);
  var tempAarray = this.state.orderArray;
  var slicedArray = tempAarray.splice(rowID, 1);
  console.log('sliced array>>>::'+ JSON.stringify(slicedArray));
  const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  this.setState({
    orderArray:tempAarray,
    tempDatasource: ds.cloneWithRows(tempAarray),
    pdfArray:tempAarray
  },()=>{console.log(this.state.tempDatasource)})
}

back(){
 // Actions.dashboard({selectedTab: 'SALESORDER'});
 Actions.pop();
}

render() {
  if (this.state.dataLoaded==false){
    return (
      <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
        <View style={{width:'100%', justifyContent:'space-between', flexDirection:'row', marginTop:'2%'}}>
          <TouchableOpacity onPress={()=>{this.back()}} style={{justifyContent:'center'}}>
            <Icon name="chevron-left" size={px2dp(20)} color="#FB9203" style={{paddingLeft:'5%', paddingRight:'5%'}}/>
          </TouchableOpacity>
          <View style={{justifyContent:'center'}}>
           <Text style={{color:'#FB9203', fontSize:20}}>SELECT PRODUCTS</Text>
           </View>
           <View>
           <Text></Text>
           </View>
        </View>
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
          <View style={{width:'90%', justifyContent:'space-between', flexDirection:'row', marginTop:'2%'}}>
            <TouchableOpacity onPress={()=>{this.handleBackPress()}} style={{justifyContent:'center'}}>
              <Icon name="chevron-left" size={px2dp(20)} color="#FB9203" style={{paddingLeft:'5%', paddingRight:'5%'}}/>
            </TouchableOpacity>
            <View style={{justifyContent:'center'}}>
             <Text style={{color:'#FB9203', fontSize:20}}>SELECT PRODUCTS</Text>
             </View>
             <View>
             <Text></Text>
             </View>
          </View>

          <View style={{alignItems:'center'}}>
           <TextInput style={{height: 40, borderColor: 'gray', borderWidth: 1, width:'90%', borderRadius:5, marginTop:'2%', marginBottom:'3%', paddingLeft:'2%'}} 
            onChange={(searchText) => this.setSearchText(searchText)} placeholderTextColor='#D6D5D3'
          underlineColorAndroid='transparent' placeholder={'Enter Text to search'}/>
          </View>
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
             <View>
                <TouchableOpacity style={{width:'100%', paddingLeft:'5%', paddingRight:'5%', justifyContent:'space-between', flexDirection:'row'}} onPress={()=>{ 
                    if (rowData.cur_stk <= Number('0.00')) {
                      errorMsg= "Stock not available";
                      this.showAlert();
                    }
                    else {
                      console.log('In Else statement>>>>>.');
                      this.quantitySelector(rowData)
                      }
                    }
                  }>
                    <View>
                    <Text style={{fontSize:15, color: '#FB9203'}}>{rowData.pat}</Text>
                      <View style={{flexDirection:'row'}}>
                        <Text style={{}}>MRP</Text>
                        <Text style={{}}>{rowData.mrp}</Text> 
                        <Text style={{marginLeft:10,color:'green'}}>Stock: </Text>
                        {Number(rowData.cur_stk) <= Number('0.00') ?
                        <Text style={{color:'grey'}}>Not Available</Text>
                        :
                        <Text style={{color:'green'}}>{rowData.cur_stk}</Text>
                        }
                        
                    </View>
                    </View>
                     {Number(rowData.cur_stk) <= Number('0.00') ? null :
                    <View style={{justifyContent:'center', }}>
                      <Icon name="plus-circle" size={px2dp(20)} color="#FB9203"/>
                    </View> 
                    }
                </TouchableOpacity>
                <View style={{height:1, width:'100%', backgroundColor:'#E8E5E2', marginBottom:'2%', marginTop:'1%'}}/> 
              </View>
            }
          />
          <PopupDialog
                  width={0.9}
                  dialogStyle={{marginTop:-200}}
                  height={250}
                  dialogTitle={<DialogTitle title="Select Quantity" />}
                  ref={(popupDialog) => { this.popupDialog = popupDialog; }}
                >
              <View style={{flex:1, alignItems: 'center'}}>
                <Hoshi label={'Quantity'} borderColor={'#FB9203'} maskColor={'#ffffff'} labelStyle={{color:'#FB9203'}} style={{width:'90%', marginTop:'2%'}} keyboardType="numeric" onChangeText={(text) => this.setState({
                  quantity: text
                })}/>
                <TouchableOpacity style={styles.button} onPress={()=>{this.addEntry()}}>
                  <Text style={{color:'white'}}>Add</Text>
                </TouchableOpacity>
              </View>
          </PopupDialog>
          <PopupDialog
                  width={0.9}
                  dialogStyle={{marginTop:-50}}
                  height={0.9}
                  dialogTitle={<DialogTitle title="Added Items" />}
                  ref={(popupDialog2) => { this.popupDialog2 = popupDialog2; }}
                >
              <View style={{flex:1, alignItems: 'center', marginTop:'2%'}}>
                <ListView
                    dataSource={this.state.tempDatasource}
                    enableEmptySections={true}
                  renderRow={(rowData, sectionID, rowID) => 
                    <View stylestyle={{width:'90%', paddingBottom:20}}>
                      <View style={{width:'85%', paddingLeft:'5%', paddingRight:'5%', justifyContent:'space-between', flexDirection:'row'}}>
                          <View style={{}}>
                            <Text style={{fontSize:15, color: '#FB9203',  flexWrap: 'wrap'}}>{rowData.prod_name}</Text>
                              <View style={{flexDirection:'row'}}>
                                  <Text style={{}}>Quantity : </Text>
                                  <Text style={{}}>{rowData.qty}</Text>
                              </View>
                              <View style={{flexDirection:'row'}}>
                                  <Text style={{}}>Rate : </Text>
                                  <Text style={{}}>{rowData.rate}</Text>
                              </View>
                              <View style={{flexDirection:'row'}}>
                                  <Text style={{}}>Total : </Text>
                                  <Text style={{}}>{rowData.amount}</Text>
                              </View>
                          </View>
                          <TouchableOpacity style={{justifyContent:'center'}} onPress={()=>{this.deleteRow(rowID)}}>
                            <Icon name="minus-square" size={px2dp(20)} color="#FB9203"/>
                          </TouchableOpacity> 
                      </View>
                      <View style={{height:1, width:'100%', backgroundColor:'#E8E5E2', marginBottom:'2%', marginTop:'1%'}}/> 
                    </View>
                    }
                  />
                  {(this.state.hideButton==false)?
                    (this.state.orderArray.length !== 0)?
                      <View style={{width:'90%', flexDirection:'row', justifyContent:'space-between'}}>
                       {(this.state.placingOrder==false)?
                         <TouchableOpacity style={styles.button2} onPress={()=>{this.postFunction()}}>
                            <Text style={{color:'white'}}>Place Order</Text>
                          </TouchableOpacity>
                          :
                          <TouchableOpacity style={styles.button2}>
                            <Text style={{color:'white'}}>Placing..</Text>
                          </TouchableOpacity>
                        } 

                        <TouchableOpacity style={styles.button3} onPress={()=>{ this.popupDialog2.dismiss()}}>
                          <Text style={{color:'white'}}>Close</Text>
                        </TouchableOpacity>
                      </View>
                      :
                      <View style={{width:'90%', flexDirection:'row', justifyContent:'center'}}>
                        <TouchableOpacity style={styles.button3} onPress={()=>{ this.popupDialog2.dismiss()}}>
                          <Text style={{color:'white'}}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    :
                    <View style={{width:'90%', flexDirection:'row', justifyContent:'center'}}>
                       <TouchableOpacity style={styles.button3}>
                          <Text style={{color:'white'}}>No Network</Text>
                        </TouchableOpacity>
                    </View>
                  }
              </View>
          </PopupDialog>
          <PopupDialog
                  width={0.9}
                  dialogStyle={{marginTop:0}}
                  height={550}
                  dialogTitle={<DialogTitle title="Print Reciept" />}
                  ref={(popupDialog3) => { this.popupDialog3 = popupDialog3; }}
                >
              <View style={{flex:1, alignItems: 'center', paddingBottom:35}}>
                <ScrollView style={{width:'90%', height:'100%', flexGrow:1}}>

                  <Text style={{paddingTop:10, paddingBottom:10}}>Date: {todayDate}</Text>
                   <Table borderStyle={{borderWidth: 1, borderColor: '#f4b258'}}>
                    <Row data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>
                    <Rows data={this.state.pdfRowData} textStyle={styles.text}/>
                  </Table>
                  <TouchableOpacity style={styles.printButton} onPress={()=>{this.print()}}> 
                    <Text style={{color:'white'}}>Print</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
          </PopupDialog>
          <ActionButton buttonColor="rgba(231,76,60,1)" renderIcon={active => active ? (<Icon name="plus" style={styles.actionButtonIcon} /> ) : (<Icon name="shopping-cart" style={styles.actionButtonIcon} />)}>
            <ActionButton.Item buttonColor='#3498db' title="Preview orders" onPress={() => {this.orderPreview()}}>
              <Icon name="list-alt" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            {(this.state.orderArray.length==0)?
              <ActionButton.Item buttonColor='#C6C5C5' title="No Items added" onPress={()=>{null}}>
              <Icon name="paper-plane" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            :
            <ActionButton.Item buttonColor='#1abc9c' title="Place Order" onPress={()=>{this.postFunction()}}>
              <Icon name="paper-plane" style={styles.actionButtonIcon} />
            </ActionButton.Item>
            }
          </ActionButton>
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

  },
  button:{justifyContent:'center', 
   alignItems:'center', 
   width:'50%', 
   backgroundColor:'#FB9203', 
   height:'30%', 
   marginTop:'10%', 
   borderRadius:5
 },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  button2:{justifyContent:'center', 
   alignItems:'center', 
   width:'45%', 
   backgroundColor:'#FB9203', 
   height:'40%', 
   marginTop:'1%', 
   marginBottom:'1%',
   borderRadius:5
 },
 button3:{justifyContent:'center', 
   alignItems:'center', 
   width:'45%', 
   backgroundColor:'#C6C5C5', 
   height:'40%', 
   marginTop:'1%', 
   marginBottom:'1%',
   borderRadius:5
 },
 printButton:{
   alignItems:'center',
   justifyContent:'center', 
   width:100, 
   backgroundColor:'#FB9203', 
   height:35, 
   marginTop:20,
   borderRadius:5
 },
 head: { height: 40, backgroundColor: '#dedbdb' },
 text: { margin: 6, fontSize:12, textAlign: 'right' }
});
