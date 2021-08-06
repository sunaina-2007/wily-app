import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity,Image,TextInput,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';


export default class TransactionScreen extends React.Component{
constructor(){
    super();
    this.state = {
     hasCameraPermissions: null,
     scanned: false,
     scannedBookId: '',
     scannedStudentId: '',
     scannedData: '',
     transactionMessage: '', 
     buttonState: 'normal'  
    }
} 
getCameraPermissions = async(id) =>{
const {status} = await Permissions.askAsync(Permissions.CAMERA)    
this.setState({
hasCameraPermissions : status === "granted" , 
buttonState: id,
scanned: false 
})
}   

handleBarCodeScanned = async({type,data}) => {
this.state({
scanned: true,
scannedData: data,
buttonState: 'normal'    
})    
} 

handleTransaction = async()=> {
var transactionMessage
db.collection("books").doc(this.state.scannedBookId).get()
.then((doc) => {
var book = doc.data();
if(book.bookAvailability){
this.initiateBookIssue();
transactionMessage = "Book Issued" ;
ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)   
}    
else{
this.initiateBookReturn();
transactionMessage = "Book Returned";    
ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
}
})
this.setState({
transactionMessage: transactionMessage    
})
}

initiateBookIssue = async()=> {
db.collection("transactions").add({
'studentId': this.state.scannedStudentId,
'bookId': this.state.scannedBookId,
'data': firebase.firestore.Timestamp.now().toDate(),
'transactionType': "Issue"    
})    

db.collection("books").doc(this.state.scannedBookId).update({
'bookAvailability': false    
})

db.collection("students").doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)    
})

this.setState({
scannedStudentId: '',
scannedBookId: ''    
})
}

initiateBookReturn = async()=> {
    db.collection("transactions").add({
    'studentId': this.state.scannedStudentId,
    'bookId': this.state.scannedBookId,
    'data': firebase.firestore.Timestamp.now().toDate(),
    'transactionType': "Return"    
    })    
    
    db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability': true    
    })
    
    db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)    
    })
    
    this.setState({
    scannedStudentId: '',
    scannedBookId: ''    
    })
    }

render(){
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState

    if(buttonState !== "normal" && hasCameraPermissions){
    return(
    <BarCodeScanner
    onBarCodeScanned = {scanned ? undefined : this.handleBarCodeScanned}
    style = {StyleSheet.absoluteFillObject}    
    
    />    
    )    
    }
    else if(buttonState === "normal"){
      return(
          <KeyboardAvoidingView style = {styles.container} behavior = 'padding' enabled>
         
         <View>
        <Image
         source = {require("../assets/booklogo.jpg")}
         style = {{width: 200,height: 200}}/>     
         <Text style = {{textAlign: 'center',fontSize: 30}}>Wily</Text>
         </View>
         <View style = {styles.inputView}>
         <TextInput 
         style = {styles.inputBox}
         placeHolder = "Book Id"
         onChangeText = {text => this.setState({scannedBookId: text})}
         value = {this.state.scannedBookId}
         />    
         <TouchableOpacity style = {styles.scanButton}
         onPress = {() => {
         this.getCameraPermissions("BookId")    
         }} 
         >

         <Text style = {styles.buttonText}>Scan</Text>    
</TouchableOpacity>
</View>

<View style = {styles.inputView}>
    <TextInput 
    style = {styles.inputBox}
    placeHolder = "Student Id"
    onChangeText = {text => this.setState({scannedStudentId: text})}
    value = {this.state.scannedStudentId}
    />
    <TouchableOpacity style = {styles.scanButton}
    onPress = {() => {
        this.getCameraPermissions("StudentId")    
        }} 
    >
        <Text style = {styles.buttonText}>Scan</Text>
        </TouchableOpacity>
        </View>
        
      )  
      <TouchableOpacity
      style = {styles.submitButton}
      onPress = {async()=> {this.handleTransaction();
      this.setState(
      {scannedBookId:'',
    scannedStudentId: '',
    } )
}}   
      >
      <Text style = {styles.submitButtonText}>Submit</Text>
      </TouchableOpacity> 
      </KeyboardAvoidingView>  
      )

return(
<View style = {styles.container}>
<Text style = {styles.DisplayText}>{
hasCameraPermissions === true ? this.state.scannedData: "request camera permissions"    
}   </Text> 
<TouchableOpacity
onPress = {this.getCameraPermissions}
style = {styles.scanButton}>
 <Text style = {styles.buttonText}>Scan QR Code </Text>    
</TouchableOpacity>
</View>
)    
}    
}
}
const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',    
},
displayText: {
fontSize: 15,
textDecorationLine: 'underline',

},
scanButton: {
backgroundColor: 'cyan',
padding: 10,
margin: 10,
    
},

buttonText: {
fontSize: 15,
textAlign: 'center',
marginTop: 10,

},

inputView: {
flexDirection: 'row',
margin: 20,

},

inputBox: {
width: 200,
height: 40,
borderWidth: 1.5,
borderRightWidth: 0,  
fontSize: 40,  
},

scanButton: {
backgroundColor: 'pink',
width: 50,
borderWith: 1.5,
borderLeftWidth: 0,    
},

submitButton: {
backgroundColor: 'cyan',
width: 100,
height: 50,    
},

submitButtonText: {
padding: 10,
textAlign: 'center',
fontSize: 20,
fontWeight: 'bold',
color: 'white',    
},
})