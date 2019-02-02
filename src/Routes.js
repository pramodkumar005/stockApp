import React, { Component } from 'react';
import {Actions,Router,Stack,Scene} from 'react-native-router-flux';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddRecord from './pages/AddRecord';
import ProductOrder_2 from './pages/ProductOrder_2';
import Register from './pages/Register';
import OutstandingDetails from './pages/OutstandingDetails';



export default class Routes extends Component<{}> {
	onBackPress = () => {
    if (Actions.state.index === 0) {
      return false
    }
    Actions.pop()
    return true
}
	render(){
		return(
		  <Router backAndroidHandler={this.onBackPress}>
		    <Stack key="root" hideNavBar={true}>
		      <Scene key="login" component={Login} title="Login" initial={true}/>
		      <Scene key="dashboard" component={Dashboard} title="Dashboard" />
		      <Scene key="addrecord" component={AddRecord} title="AddRecord" />
		      <Scene key="addrecord" component={AddRecord} title="AddRecord" />
		      <Scene key="productorder_2" component={ProductOrder_2} title="ProductOrder_2" />
		      <Scene key="register" component={Register} title="Register" />
		      <Scene key="outstandingdetails" component={OutstandingDetails} title="OutstandingDetails" />
		    </Stack>
		  </Router>
		)
	}

}