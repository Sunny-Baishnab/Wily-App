import * as React from 'react';
import{Text,View,StyleSheet , TouchableOpacity , Image , Alert , KeyboardAvoidingView , ToastAndroid} from 'react-native';
import *as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from '../config';

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookId:'',
            scannedStudentId:'',
            transactionMessage:''
        }
    }

    getCameraPermission = async(Id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:Id,
            scanned:false
        })
    }

    handleBarCodeScan = async({type , data})=>{
        const {buttonState} = this.state;
        if(buttonState==='bookId'){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
        }
        else if(buttonState==='studentId'){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
        }
    }

    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db.collection('students').where('studentId','==',this.state.scannedStudentId).get()
        var isStudentEligible = ''
        if(studentRef.docs.length==0){
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
            isStudentEligible = false
            Alert.alert('Student does not exist in the Database');
        }
        else{
            studentRef.docs.map((doc)=>{
                var student = doc.data();
                if(student.numberOfBooksIssued<2){
                    isStudentEligible = true
                }
                else{
                    isStudentEligible = false
                    Alert.alert('This Student has already taken two Books');
                    this.setState({
                        scannedStudentId:'',
                        scannedBookId:''
                    })
                }
            })
        }
        return isStudentEligible
    }

    checkStudentEligibilityForBookReturn = async()=>{
        const transactionRef = await db.collection('transaction').where('bookId','==',this.state.scannedBookId).limit(1).get();
        var isStudentEligible = ''
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction = doc.data();
            if(lastBookTransaction.studentId===this.state.scannedStudentId){
                isStudentEligible=true
            }
            else{
                isStudentEligible = false
                Alert.alert('Book was not Issued by this Student');
                this.setState({
                    scannedStudentId:'',
                    scannedBookId:''
                })
            }
        })
        return isStudentEligible
    }

    checkBookEligibility = async()=>{
        const BookRef = await db.collection('books').where('bookId','==',this.state.scannedBookId).get();
        var transactionType = ''
        if(BookRef.length===0){
            transactionType = false
            Alert.alert('The Book does not exist')
        }
        else{
            BookRef.docs.map((doc)=>{
                var Book = doc.data();
                if(Book.bookAvailability){
                    transactionType = 'Issue'
                }
                else{
                    transactionType = 'Return'
                }
            })
        }
        return transactionType
    }

    handleTransaction = async()=>{
        var transactionType = await this.checkBookEligibility();
        if(!transactionType){
            Alert.alert('The Book doesnot exist in the Database')
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
        }
        else if(transactionType==='Issue'){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert('Book Issued to the Student');
            }
        }
        else{
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert('Book Returned by the Student');
            }
        }
        
    }

    initiateBookIssue = async() =>{
        db.collection('transaction').add({
            studentId:this.state.scannedStudentId,
            bookId : this.state.scannedBookId,
            date : firebase.firestore.Timestamp.now().toDate(),
            transactionType:'Issue'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability:false
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
        })

        Alert.alert('Book Issued')

        this.setState({
            scannedBookId:'',
            scannedStudentId:''
        })
    }

    initiateBookReturn = async()=>{
        db.collection('transaction').add({
            studentId:this.state.scannedStudentId,
            bookId : this.state.scannedBookId,
            date : firebase.firestore.Timestamp.now().toDate(),
            transactionType:'Return'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailability:true
        })

        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
        })

        Alert.alert('Book Returned')

        this.setState({
            scannedBookId:'',
            scannedStudentId:''
        })
    }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState!=='normal'&&hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarCodeScanned = {scanned?undefined:this.handleBarCodeScan} 
                style= {StyleSheet.absoluteFillObject}/>
            )
        }
        else if(buttonState==='normal'){

        
        return(
            <KeyboardAvoidingView style = {styles.Container} behavior = "padding" enabled>
            <View style={styles.Container}>
                <View>
                    <Image style = {{width:200 , height:200}} source = {require('../assets/booklogo.jpg')}/>
                    <Text style = {{textSize:35 , textAlign:'center' , fontWeight:'bold'}}>Wireless Library Management</Text>
                </View>
                
                <View style = {styles.inputView}>
                    <TextInput style = {styles.inputbox} 
                    placeholder = 'bookId' 
                    value={this.state.scannedBookId} 
                    onChangeText = {text=> this.setState({scannedBookId:text})}/>
                    <TouchableOpacity style  = {styles.OR} onPress={()=>{
                        this.getCameraPermission('bookId')
                    }}>
                        <Text style = {styles.ButtonText}>Scan</Text>
                    </TouchableOpacity>
                </View>
                <View style = {styles.inputView}>
                    <TextInput style = {styles.inputbox} 
                    placeholder = 'studentId' 
                    value={this.state.scannedStudentId}
                    onChangeText = {text=> this.setState({scannedStudentId:text})}/>
                    <TouchableOpacity style  = {styles.OR} onPress={()=>{
                        this.getCameraPermission('studentId')
                    }}>
                        <Text style = {styles.ButtonText}>Scan</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style = {styles.submitButton} onPress={async()=>{
                    var transactionMessage = this.handleTransaction()
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })}}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
        )
    }
    }
}

const styles = StyleSheet.create({
    Container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    },
    QR:{
        width:'80%',
        height:70,
        backgroundColor:'blue',
        padding:20,
        borderRadius:5,
        margin:10
    },
    ButtonText:{
        fontSize:20,
        fontWeight:'bold',
        textDecorationLine:'underline',
        textAlign:'center'
    },
    inputView:{
        flexDirection:'row',
        margin:40
    },
    inputbox:{
        borderRadius:5,
        width:260,
        height:40,
        borderWidth:5,
        textAlign:'center'
    },
    submitButton:{
        width:'80%',
        height:60,
        backgroundColor:'yellow',
    },
    submitButtonText:{
        fontSize:20,
        fontWeight:'bold',
        padding:10,
        textAlign:'center',
        color:'black'
    }
})