import React from 'react';
import { StyleSheet, Text, View , Image} from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import SearchScreen from './Screens/SearchScreen';
import BookTransactionScreen from './Screens/BookTransactionScreen';

export default class App extends React.Component {
  render(){
    return (
      <AppContainer/>
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction:BookTransactionScreen,
  Search:SearchScreen
},
{
defaultNavigationOptions:({navigation})=>({
  tabBarIcon:({})=>{
    const routeName = navigation.state.routeName
    if(routeName==='Transaction'){
      return(
        <Image style = {{width:40 , height:40}} source = {require('./assets/book.png')}/>
      )
    }
    else if(routeName==='Search'){
      return(
        <Image  style = {{width:40 , height:40}} source = {require('./assets/searchingbook.png')}/>
      )
    }
  }
})
})
const AppContainer = createAppContainer(TabNavigator);