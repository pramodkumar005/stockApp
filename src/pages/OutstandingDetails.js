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
  BackHandler,
  DatePickerAndroid,
  ActivityIndicator,
  Alert
  //Share
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import RNHTMLtoPDF   from 'react-native-html-to-pdf';
import {Dimensions} from 'react-native';
import { Hoshi, Sae } from 'react-native-textinput-effects';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { filter, indexOf, invert, findKey } from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showMessage, hideMessage } from "react-native-flash-message";
import { Table, Row, Rows } from 'react-native-table-component';
import Share, {ShareSheet, Button} from 'react-native-share';
import Permissions from 'react-native-permissions';


var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});

var errorMsg = '';

var closingBalanceTotal = 0.00;

var pdfContent='';

const deviceW = Dimensions.get('window').width
const basePx = 375
function px2dp(px) {
  return px *  deviceW / basePx
}


export default class OutstandingDetails extends Component<{}> {
  constructor(props)
    {
        super(props);
        this.state = { 
          dataSource:ds.cloneWithRows(['']),
          startDtFilter:'',
          endDtFilter:'',
          startDtFilterLabel:'Select Date',
          endDtFilterLabel:'Select Date',
          dataLoaded: false,
          allDataArray : [],
          searchText:'',
          companyId:'',
          refreshing: false,
          total:'0.00',
          customerCode: props.item.customercode,
          openingBalance: props.item.opbal,
          phone:'123',
          tableHead: ['Date', 'Type', 'Bill No.', 'Debit', 'Credit'],
          tableData: [
            ['1', '2', '3', '4', '5'],
            ['a', 'b', 'c', 'd', 'e'],
            ['1', '2', '3', '456\n789', 'ew'],
            ['a', 'b', 'c', 'd', 'e']
          ],
          reset:false,
          filterVisible:false,
          totalDebit:0,
          totalFilteredDebit:0,
          closingBalance:0,
          sharePdf:false,
          loader:false
        }
    this.fetchFunction = this.fetchFunction.bind(this);
    this.selectStart = this.selectStart.bind(this);
    this.selectEnd = this.selectEnd.bind(this);
    this.filterData = this.filterData.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.generatePDF = this.generatePDF.bind(this);
    }


componentWillMount() {
NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({
        connected: isConnected
      })
    });
NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
BackHandler.addEventListener('hardwareBackPress', this.handleBackPress.bind(this));

console.log('>>>>>>>>>componentWillMount>>>ListOutstading');

}

componentDidMount(){
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
  console.log('componentWillUnmount>>>>>>> ListOutstading');
  NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress.bind(this));
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

  handleBackPress = () => {
  console.log('I am in abck action outstanding');
  this.state.allDataArray=[];
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress.bind(this));
  Actions.dashboard();
  return true;
}


_requestPermission = () => {
          Permissions.request('storage').then(response => {
            // Returns once the user has chosen to 'allow' or to 'not allow' access
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            // this.setState({ storage: response })
            this.permissionsRequest();

          })
  }

permissionsRequest(){

  Permissions.check('storage').then(response => {
      console.log('>>>>>>>>>>>>>>>>>>>>'+response);
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      //this.setState({ storagePermission: response })
      if (response=='authorized') {
          console.log('Permission is granted>>>>>>>>>>>');
          generatePDF();
      }else{
        console.log('Permission not granted>>>>>>>>>>>');

        Alert.alert(
            'Access Request',
            'To generate report need access to the files',
            [
              {
                text: 'No',
                onPress: () => console.log('Permission denied'),
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => this._requestPermission(),
                style: 'cancel',
              }
            ],
          )

      }
    })

}


generatePDF(){

  this.setState({
    loader:true
  })

  console.log('>>>>>>>>>>>>>>>>>>>1111111111111');
    let options = {
      html: pdfContent,
      fileName: 'sample',
      directory: 'Documents',
      height: 800,
      width: 1056,
      padding: 24,
      base64: true
    };
  console.log('>>>>>>>>>>>>>>>>>>>2222222222222222');



    RNHTMLtoPDF.convert(options).then(fileData => {
      console.log('>>>>>>>>>>>>>>>>>>>33333333333333333333');
      console.log('PDF generated', fileData);
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.');
      console.log(fileData.base64); 
      console.log(fileData.filePath);

      Share.open({
        title: "Ledger Details",
        // message: "I just wanted to show you this:",
        url: "data:application/pdf;base64," + fileData.base64,
        subject: "Quotation",
      });
    });
  }

fetchFunction(){
console.log('Fetching>>>>>>>>>>>>>>>>>>>>'+global.outstandingDetails+ this.state.companyId.slice(1,-1));
let compID =  this.state.companyId.slice(1,-1);
console.log('Connection status::' + compID);
NetInfo.isConnected.fetch().then(isConnected =>{

    console.log('Connection status::'+isConnected +"::" + compID);
    if(isConnected==true) {  
    this.setState({connected:true}); 
    fetch(global.outstandingDetails+compID+'&id='+this.state.customerCode, {
    method: 'GET',
    headers: {
     'Content-Type': 'application/json',
    }
  })
  .then((response) => response.json())
      .then((responseJson) => {

          console.log(responseJson.tablesDetails);

          this.setState({
            rawData: responseJson.tablesDetails
          })
         


          var totalDebit = 0.00;
          var totalCredit = 0.00;
          for (var i = 0; i < responseJson.tablesDetails.length; i++) {

            totalDebit = totalDebit+Number(responseJson.tablesDetails[i].vdr, 10);
            totalCredit = totalCredit+Number(responseJson.tablesDetails[i].vcr, 10);
          }
          closingBalanceTotal = Number(this.state.openingBalance) + totalDebit - totalCredit;
          this.setState({
            closingBalance: closingBalanceTotal
          })
          console.log('>>>>>>>>'+ this.state.closingBalance );

          //data display array
         

          console.log('tempArray>>>>>>>>1');
           var tempArray2 = [];
           var totalVdr = 0;
           var totalCdr = 0;
           for (var i = 0; i < responseJson.tablesDetails.length; i++) {
            console.log('tempArray>>>>>>>>2');
            tempArray = [];
            var date = responseJson.tablesDetails[i].vdate;
            tempArray.push(date);
            var trans = responseJson.tablesDetails[i].vnar;
            tempArray.push(trans);
            var billNo = responseJson.tablesDetails[i].vno;
            tempArray.push(billNo);
            var debit = responseJson.tablesDetails[i].vdr;
            tempArray.push(debit);
            var credit = responseJson.tablesDetails[i].vcr;
            tempArray.push(credit);

            tempArray2.push(tempArray);
            totalVdr = (Number(totalVdr)+Number(debit));
            totalCdr = (Number(totalCdr)+Number(credit));
          }
          console.log('totalVdr>>>>>'+totalVdr);
          console.log('totalCdr>>>>>'+totalCdr);
          console.log('All tempArray2 length>>>>>'+tempArray2.length);

         this.setState({
          allDataArray: tempArray2,
          dataSource: ds.cloneWithRows(responseJson.tablesDetails),
          data: responseJson.tablesDetails,
          dataLoaded: true,
          refreshing:false,
          totalDebit: totalVdr,
          totalCredit: totalCdr
         });


         //console.log(':::'+Number.parseFloat(responseJson.cur_bal_tot).toFixed(2));
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


_onRefresh = () => {
  if(this.state.connected==true) {
    this.setState({refreshing: true});
    this.fetchFunction();
  } else {
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


selectStart(){
   var startDate='';
   var assignedDate='';
   if(this.state.startDtFilter.length==0){
    assignedDate = '';
    console.log('if>>>>>>>>');
   }else{
    assignedDate = this.state.startDtFilter;
    console.log('else>>>>>>>>>>>>>'+this.state.startDtFilter);
   }
    DatePickerAndroid.open({
      date: new Date(assignedDate)
    })
          .then(function (date) {
            console.log('selected date>>.'+ JSON.stringify.date);
            if (date.action !== DatePickerAndroid.dismissedAction) {
              startDate = date.year+'-' +(date.month+1)+'-' +date.day;
              console.log('selected date.year: ', date.year);
              console.log('selected date.month: ', (date.month+1));
              console.log('selected date.day: ', date.day);
              console.log('selected date is: ', startDate);


              var month= JSON.stringify(date.month+1);
              console.log('Month>>>>>>>'+month.length);
              if( JSON.stringify(date.month+1).length == 1){
                month = '0'+month;
              }

              console.log('Updated Month>>>>>>>'+month);

              var day= JSON.stringify(date.day);
              console.log('day>>>>>>>'+day.length);
              if( JSON.stringify(date.day).length == 1){
                day = '0'+day;
              }
              console.log('Updated day>>>>>>>'+day);

            }

             if (date.action == DatePickerAndroid.dismissedAction) {
              // Selected year, month (0-11), day

             if(this.state.startDtFilter.length==0){
              currentDate = new Date();
              }else{
              currentDate = new Date(this.state.endDtFilter);  
              }

              date.year = currentDate.getFullYear();
              month = currentDate.getMonth()+1;
              date.month = currentDate.getMonth()+1;
              day = currentDate.getDate();
              date.day = currentDate.getDate();

              if( JSON.stringify(date.month+1).length == 1){
                month = '0'+month;
              }
               if( JSON.stringify(date.day).length == 1){
                day = '0'+day;
                date.day =day;
              }
              //console.log('Date day::'+date.day+'::::' +day);              
              //console.log('Date Picker Canel::'+this.state.startDtFilter+'::::' +(currentDate));
            }

            this.setState({
                startDtFilter: (date.year+'-'+month+'-'+day),
                startDtFilterLabel: (date.day+'/' + month +'/' +date.year)
              });
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+startDate);
          }.bind(this));
}

selectEnd(){
   var endDate='';
   var assignedDate='';
   if(this.state.endDtFilter.length==0){
    assignedDate = '';
    console.log('if>>>>>>>>');
   }else{
    assignedDate = this.state.endDtFilter;
    console.log('else>>>>>>>>>>>>>'+this.state.endDtFilter);
   }
    DatePickerAndroid.open({
      date: new Date(assignedDate)
    })
          .then(function (date) {
            if (date.action !== DatePickerAndroid.dismissedAction) {
              endDate = date.year+'-' +(date.month+1)+'-' +date.day;
              console.log('selected date.year: ', date.year);
              console.log('selected date.month: ', (date.month+1));
              console.log('selected date.day: ', date.day);
              console.log('selected date is: ', endDate);

              var month= JSON.stringify(date.month+1);
              console.log('Month>>>>>>>'+month.length);
              if( JSON.stringify(date.month+1).length == 1){
                month = '0'+month;
              }

              console.log('Updated Month>>>>>>>'+month);

              var day= JSON.stringify(date.day);
              console.log('day>>>>>>>'+day.length);
              if( JSON.stringify(date.day).length == 1){
                day = '0'+day;
              }
              console.log('Updated day>>>>>>>'+day);
            }

            if (date.action == DatePickerAndroid.dismissedAction) {
              // Selected year, month (0-11), day
              if(this.state.endDtFilter.length==0){
              currentDate = new Date();
              }else{
              currentDate = new Date(this.state.endDtFilter);  
              }
              
              date.year = currentDate.getFullYear();
              month = currentDate.getMonth()+1;
              date.month = currentDate.getMonth()+1;
              day = currentDate.getDate();
              date.day = currentDate.getDate();

              if( JSON.stringify(date.month+1).length == 1){
                month = '0'+month;
              }
               if( JSON.stringify(date.day).length == 1){
                day = '0'+day;
                date.day =day;
              }
              //console.log('Date day::'+date.day+'::::' +day);              
              //console.log('Date Picker Canel::'+this.state.endDtFilter+'::::' +(currentDate));
            }


            this.setState({ 
                endDtFilter: (date.year+'-'+month+'-'+day),
                endDtFilterLabel: (date.day+'/' + month +'/' +date.year)
              });
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+endDate);
          }.bind(this));
}

filterData(){
  if (this.state.startDtFilter.length==0 || this.state.endDtFilter.length==0) {
    console.log('Start date is empty>>>>>>>>>.');
    errorMsg= "Please select Date";
      this.showAlert();

  }else {
   //filtering the data as per date **start
          var filteredData =[];
          for (var i = 0; i < this.state.rawData.length; i++) {
            voucherDate = this.state.rawData[i].vdate;
            console.log(voucherDate);
            var vdate = voucherDate.slice(0, 2);
            var vmonth = voucherDate.slice(3, 5);
            var vyear = voucherDate.slice(6, 10);
            var vfullDate = vyear+'-'+vmonth+'-'+vdate ;

            console.log('>>>>>>>>'+new Date(vfullDate)+':::::'+ new Date(this.state.endDtFilter)+'::::'+new Date(this.state.startDtFilter));
            console.log('>>>>>>>>'+ this.state.endDtFilter+'::::'+this.state.startDtFilter);

            if (+(new Date(vfullDate)) <= +(new Date(this.state.endDtFilter)) && +(new Date(vfullDate)) >= +(new Date(this.state.startDtFilter))){
              // console.log('I am here>>>>>>>>>'+i+'::::'+voucherDate+':::'+ new Date(vfullDate));
               filteredData.push(this.state.rawData[i]);
            }
          }
          console.log('filteredData>>>>>>>'+ JSON.stringify(filteredData));

          var tempArray2 = [];
          var filteredVdr = 0;
          var filteredCdr = 0;
          for (var i = 0; i < filteredData.length; i++) {
            console.log('tempArray>>>>>>>>2');
            tempArray = [];
            var date = filteredData[i].vdate;
            tempArray.push(date);
            var trans = filteredData[i].vnar;
            tempArray.push(trans);
            var billNo = filteredData[i].vno;
            tempArray.push(billNo);
            var debit = filteredData[i].vdr;
            tempArray.push(debit);
            var credit = filteredData[i].vcr;
            tempArray.push(credit);

            tempArray2.push(tempArray);

            filteredVdr = (Number(filteredVdr)+Number(debit));
            filteredCdr = (Number(filteredCdr)+Number(credit));

            console.log('total Filtered filteredVdr>>>>'+filteredVdr);
            console.log('total Filtered filteredCdr>>>>'+filteredCdr);
          }

          // filter the data from top to last date

          var filteredDataFull =[];
          for (var i = 0; i < this.state.rawData.length; i++) {
            voucherDate = this.state.rawData[i].vdate;
            console.log(voucherDate);
            var vdate = voucherDate.slice(0, 2);
            var vmonth = voucherDate.slice(3, 5);
            var vyear = voucherDate.slice(6, 10);
            var vfullDate = vyear+'-'+vmonth+'-'+vdate ;

            console.log('>>>>>>>>'+new Date(vfullDate)+':::::'+ new Date(this.state.endDtFilter)+'::::'+new Date(this.state.startDtFilter));
            console.log('>>>>>>>>'+ this.state.endDtFilter+'::::'+this.state.startDtFilter);

            if (+(new Date(vfullDate)) <= +(new Date(this.state.endDtFilter)) && +(new Date(vfullDate)) >= +(new Date('2000-01-01'))){
              // console.log('I am here>>>>>>>>>'+i+'::::'+voucherDate+':::'+ new Date(vfullDate));
               filteredDataFull.push(this.state.rawData[i]);
            }
          }
          console.log('filteredDataFull>>>>>>>'+ JSON.stringify(filteredDataFull));

          var tempArray2Full = [];
          var filteredVdrFull = 0;
          var filteredCdrFull = 0;
          for (var i = 0; i < filteredDataFull.length; i++) {
            console.log('tempArray>>>>>>>>2');
            tempArrayFull = [];
            var dateFull = filteredDataFull[i].vdate;
            tempArrayFull.push(dateFull);
            var transFull = filteredDataFull[i].vnar;
            tempArrayFull.push(transFull);
            var billNoFull = filteredDataFull[i].vno;
            tempArrayFull.push(billNoFull);
            var debitFull = filteredDataFull[i].vdr;
            tempArrayFull.push(debitFull);
            var creditFull = filteredDataFull[i].vcr;
            tempArrayFull.push(creditFull);

            tempArray2Full.push(tempArrayFull);

            filteredVdrFull = (Number(filteredVdrFull)+Number(debitFull));
            filteredCdrFull = (Number(filteredCdrFull)+Number(creditFull));

            console.log('total Filtered filteredVdrFull>>>>'+filteredVdrFull);
            console.log('total Filtered filteredCdrFull>>>>'+filteredCdrFull);
          }




          newOpeningBalance = (filteredVdrFull - filteredVdr) - (filteredCdrFull- filteredCdr);
          var openingBalanceWithExistingOpeningBalance = Number(newOpeningBalance)+ Number(this.props.item.opbal);
          newClosingBalance = filteredVdr + openingBalanceWithExistingOpeningBalance - filteredCdr;
          console.log('newOpeningBalance>>>>>>'+newOpeningBalance);
          console.log('newClosingBalance>>>>>>'+newClosingBalance);
          this.setState({
            allDataArray:tempArray2,
            totalFilteredDebit: filteredVdr,
            openingBalance: openingBalanceWithExistingOpeningBalance, 
            closingBalance: newClosingBalance
          },()=>{
                       //creating html data for the PDF
          var pdfOutstanding = '<div style="background: #78B05C;padding: 10;width: 100px;border-radius: 10px;margin-bottom: 10px;"> <label>Outstanding</label></br> <span>Rs: '+this.state.openingBalance +'</span></div>';

          var pdfClosingBalance = '<div style="background: #FB9203;padding: 10;width: 100px;border-radius: 10px;margin-top: 20px;margin-left:400px"> <label>Outstanding</label></br> <span>Rs: '+this.state.closingBalance +'</span></div>';

          var pdfTable = '<table><tr style="background:#FB9203;text-align:left"><th style="padding-left:5px;width:100px">Date</th><th style="padding-left:5px;width:100px">Type</th><th style="padding-left:5px;width:100px">BillNo.</th><th style="padding-left:5px;width:100px">Debit</th><th style="padding-left:5px;width:100px">Credit</th></tr>';

           for (var i = 0; i < filteredData.length; i++) {
            console.log('tempArray>>>>>>>>2');
            tempArray = [];
            var date = filteredData[i].vdate;
            tempArray.push(date);
            var trans = filteredData[i].vnar;
            tempArray.push(trans);
            var billNo = filteredData[i].vno;
            tempArray.push(billNo);
            var debit = filteredData[i].vdr;
            tempArray.push(debit);
            var credit = filteredData[i].vcr;
            tempArray.push(credit);

            pdfTable= pdfTable+ '<tr><td style="width:100px">'+date+'</td><td style="width:100px">'+trans+'</td><td style="width:100px">'+billNo+'</td><td style="width:100px">'+debit+'</td><td style="width:100px">'+credit+'</td></tr>'
          }

          pdfTable= pdfTable+ '</table>';

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+JSON.stringify (pdfTable)+' ::: opening Balance'+this.state.openingBalance +' ::: closing Balance'+this.state.closingBalance);

          pdfContent = pdfOutstanding + pdfTable + pdfClosingBalance;

          this.setState({
            sharePdf:true
          })

          })



  }

}


showAlert(){
  showMessage({
              message: errorMsg,
              type: "info",
            });
}



resetFilter(){
  var tempArray2 = [];
          for (var i = 0; i < this.state.rawData.length; i++) {
            console.log('tempArray>>>>>>>>2');
            tempArray = [];
            var date = this.state.rawData[i].vdate;
            tempArray.push(date);
            var trans = this.state.rawData[i].vnar;
            tempArray.push(trans);
            var billNo = this.state.rawData[i].vno;
            tempArray.push(billNo);
            var debit = this.state.rawData[i].vdr;
            tempArray.push(debit);
            var credit = this.state.rawData[i].vcr;
            tempArray.push(credit);

            tempArray2.push(tempArray);
          }
          this.setState({
            allDataArray:tempArray2,
            startDtFilter: '',
            endDtFilter: '',
            startDtFilterLabel:'Select Date',
            endDtFilterLabel:'Select Date',
            openingBalance: this.props.item.opbal,
            closingBalance: closingBalanceTotal,
            sharePdf:false
          })
}

openFilter(){
  this.setState({
    filterVisible:true
  })
}

closeFilter(){
  this.setState({
    filterVisible:false
  })
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
      <View style={{flex:1}}>
        <View style={{marginLeft:'2%', marginRight:'2%', paddingBottom:'2%',  paddingTop:5}}>

         <View style={{height:30, marginTop:'1%', justifyContent:'space-between', flexDirection:'row', marginLeft:'2%', borderBottomWidth:1, borderBottomColor:'#E8E5E2', marginBottom:10, alignItems:'center', paddingBottom:10}}>
            <TouchableOpacity style={{paddingRight:10}} onPress={()=>{this.setState({allDataArray:[]}); Actions.dashboard();}}>
              <Icon name="chevron-left" size={px2dp(20)} color="#FB9203"/>
            </TouchableOpacity>
            <View>
              <Text style={{fontSize:20, marginLeft:'5%', color: "#FB9203"}}>DETAILS</Text>
            </View>
             <View>
              <Text></Text>
            </View>
         </View>

         <ScrollView contentContainerStyle={{paddingBottom:60}} showsVerticalScrollIndicator={false}>
            <Text style={{paddingLeft:'3%', fontSize:15, color: '#FB9203'}}>{this.props.item.name}</Text>
             {(this.state.allDataArray.length==0)?
              null
              :
              <View style={{flexDirection:'row', alignItems:'flex-end', marginLeft:'3%', justifyContent:'space-between'}}>
                <View style={{width:125, height:50, backgroundColor:'#78B05C', borderRadius:5, justifyContent:'center', alignItems:'center',padding:5, marginTop:10}}>
                  <Text style={{color:'white', fontSize:12}}>Opening Balance </Text>
                  <Text style={{color:'white'}}><Icon name="rupee" size={px2dp(12)} color="white"/> {this.state.openingBalance}</Text>
                </View>
                {this.state.sharePdf==false? null :
                  
                    <TouchableOpacity onPress={()=>{this.generatePDF()}} style={{marginRight:10, flexDirection:'row'}}>
                      <Icon name="file" size={px2dp(18)} color="#FB9203" style={{marginRight:5}}/>
                      <Text style={{color:"#FB9203"}}>Share as PDF</Text>
                    </TouchableOpacity>
          
                }
                
              </View>
              
              }

            {this.state.filterVisible==false?
            <View style={{marginTop:10}}>
              <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderBottomColor:'#FB9203', borderBottomWidth:1, marginLeft:'3%', marginRight:'3%', height:25, borderRadius:5}} onPress={()=>{this.openFilter()}}>
                <View>
                  <Text style={{color:'#FB9203', paddingLeft:5}}>Date Filter</Text>
                </View>
                {(this.state.startDtFilter.length==0)? null:
                <View>
                  <Text style={{color:'#FB9203'}}>From: {this.state.startDtFilterLabel}  To: {this.state.endDtFilterLabel}</Text>
                </View>
                }
                <View style={{alignItems:'center', alignItems:'center'}}>
                  <Icon name="sort-down" size={px2dp(20)} color="#FB9203" style={{marginRight:5}}/>
                </View>
              </TouchableOpacity>
            </View>  
            :
            <View style={{borderWidth:1,borderColor:'#FB9203', marginTop:10, borderRadius:5, marginLeft:'3%',marginRight:'3%',}}>
              <TouchableOpacity style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#FB9203', height:25}} onPress={()=>{this.closeFilter()}}>
                <Text style={{color:'white', paddingLeft:5}}>Date Filter</Text>
                <Icon name="sort-up" size={px2dp(20)} color="white" style={{marginRight:5}}/>
              </TouchableOpacity>
              <View style={{flexDirection:'row', paddingLeft:5, paddingTop:5}}>
                <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{this.selectStart()}}>
                  <Text style={{fontSize:16, color:'#FB9203'}}>From: </Text>
                  <Text style={{fontSize:16, borderBottomWidth:1, paddingLeft:5, paddingRight:5, borderBottomColor:'#FB9203'}}>{this.state.startDtFilterLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{flexDirection:'row', marginLeft:25}} onPress={()=>{this.selectEnd()}}>
                  <Text style={{fontSize:16, color:'#FB9203'}}>To: </Text>
                  <Text style={{fontSize:16, borderBottomWidth:1, paddingLeft:5, paddingRight:5, borderBottomColor:'#FB9203'}}>{this.state.endDtFilterLabel}</Text>
                </TouchableOpacity>
              </View>
                
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:15}}>
                <TouchableOpacity style={{flexDirection:'row', borderWidth:1, borderColor:'white',paddingLeft:5, paddingRight:5, borderRadius:5, height:30, alignItems:'center', width:50, justifyContent:'center', marginTop:10, marginRight:10, marginBottom:5, width:80}} onPress={()=>{this.resetFilter()}}>
                  <Text style={{color:'#FB9203'}}>Clear Filter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{flexDirection:'row', backgroundColor:'#FB9203',paddingLeft:5, paddingRight:5, borderRadius:5, height:30, alignItems:'center', width:50, justifyContent:'center', marginTop:10, marginLeft:5, marginBottom:5, marginRight:10}} onPress={()=>{this.filterData()}}>
                  <Text style={{color:'white'}}>Filter</Text>
                </TouchableOpacity>               
              </View>
                
            </View>
            }

            <View style={{marginTop:10}}>
              <Table borderStyle={{borderWidth: 1, borderColor: '#f4b258'}}>
                <Row data={this.state.tableHead} style={styles.head} textStyle={styles.text}/>
                <Rows data={this.state.allDataArray} textStyle={styles.text}/>
              </Table>
            </View>

            <View style={{alignItems:'flex-end', marginTop:15}}>
              {(this.state.allDataArray.length==0)?
              null
              :
              <View style={{width:125, height:50, backgroundColor:'#FB9203', right:0, borderRadius:5, justifyContent:'center', alignItems:'center',padding:5, marginTop:10}}>
                <Text style={{color:'white', fontSize:12}}>Closing Balance </Text>
                <Text style={{color:'white'}}><Icon name="rupee" size={px2dp(12)} color="white"/> { this.state.closingBalance }</Text>
              </View>
              }
            </View>
           
        </ScrollView>

      </View>
      </View>
    );
  }
}

render() {
    return (
      <View style={styles.container}>
        {this.renderCondition()}
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

  },
  head: { height: 40, backgroundColor: '#f4b258' },
  text: { margin: 6, fontSize:12 }
});
