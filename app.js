var express=require("express");
var bodyParser=require("body-parser");
var mongoose = require('mongoose');
var ejs=require('ejs');
const emailvalidator = require("email-validator");
mongoose.connect('mongodb://localhost:27017/airline',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})  
var app=express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile)
app.set('views',"./views");


//signup
var email;
var password;
app.post("/signup",function(req,res){
    var member=req.body.selectpicker;
if(req.body.username!=null)
{
    var name = req.body.username;
}else{
    res.status(400).send('Invalid username');
}
if(emailvalidator.validate(req.body.email)){
    email = req.body.email;
}else{
   res.status(400).send('Invalid Email');
} 

if(req.body.password.length>6 && req.body.password==req.body.cnfmpassword)
{
    password = req.body.password;
}
else{
    res.status(400).send('Invalid password');
 }
if(req.body.contact.length==10)
{
    var contact = req.body.contact;
}
else{
    res.status(400).send('Invalid phone number');
}



    var data = {
        "username": name,
        "member":member,
        "email" : email,
        "password": password,
        
        "contact" : contact,
        "login":1
    }
    console.log(email);
    if(member=="admin"){
        db.collection('admins').insertOne(data,(err,collection)=>{
            if(err){
                throw err;
            }
            console.log("Record Inserted Successfully");
        });
        return res.redirect('home.html');
    }
    if(member=="user")
    {
    
    db.collection('customers').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });
    return res.redirect('admin.html');
}
    
    
})


//login

var email;
var password;

 const loginsSchema= new mongoose.Schema({
    email:String,
    password:String,
    login:Number
})
const Login=mongoose.model('Login',loginsSchema);
const customersSchema={
    
    username:String,
    email:String,
    password:String,
    
    contact:String
    
}
const Customer= mongoose.model('Customer',customersSchema);

const adminsSchema={
    
    username:String,
    email:String,
    password:String,
  
    contact:String
    
}
const Admin= mongoose.model('Admin',adminsSchema);

app.post("/loginDetails", function(req, res) {
    email=req.body.email;
     password=req.body.password;
     var member=req.body.selectpicker;
     if(member=="user")
     {
     checkpassuser(req,res,email,password)
     } 
     if(member=="admin")
     {
        checkpassadmin(req,res,email,password)
     }
})
app.get('/loginDetails',checkpassuser);
function checkpassuser(req,res){
    console.log(email);
    console.log(password);
    Customer.findOne({email:email,password:password}).then(customers=>{
        //console.log(customers);
        if(customers!=null){
            console.log("Done Login");
           
            db.collection('customers').updateOne({email:email},{$set:{login:1}},(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("Record Inserted Successfully");
            })
                res.redirect('home.html')
				
			}      
        else{
			console.log("failed");
            
            res.redirect('login.html')
		}  
        })
    }

    function checkpassadmin(req,res){
        console.log(email);
        console.log(password);
        Admin.findOne({email:email,password:password}).then(admins=>{
            //console.log(admins);
            if(admins!=null){
                console.log("Done Login");
               
                db.collection('admins').updateOne({email:email},{$set:{login:1}},(err,collection)=>{
                    if(err){
                        throw err;
                    }
                    console.log("Record Inserted Successfully");
                })
                    res.redirect('admin.html')
                    
                }      
            else{
                console.log("failed");
                res.redirect('login.html')
            }  
            })
        }
//user profile
app.get('/',(req,res)=>{
    res.render('home.html');
})



app.get('/',(req,res)=>{
    res.render('profile');
})
app.get("/profile",(req,res)=>{
    Customer.find({email:email,password:password,login:1}).then(customers=>{
        if(customers!=null){
        
       res.render('profile',{
        customersList:customers,
       
       })
    }

    })
})
app.get('/',(req,res)=>{
    res.render('home.html');
})


//admin profile
app.get('/',(req,res)=>{
    res.render('home.html');
})



app.get('/',(req,res)=>{
    res.render('adminprofile');
})
app.get("/adminprofile",(req,res)=>{
    Admin.find({email:email,password:password,login:1}).then(admins=>{
        console.log(admins);
        if(admins!=null){
        
       res.render('adminprofile',{
        adminsList:admins,
       
       })
    }

    })
})
app.get('/',(req,res)=>{
    res.render('home.html');
})




//add flights

var tickprice;
var takeoffdate;
app.post("/add",function(req,res){
    var id=req.body.id;
    var name = req.body.selectpicker2;
    var type = req.body.selectpicker3;
    var takeoffloc=req.body.selectpicker;
    var landingloc=req.body.selectpicker1;
    takeoffdate=req.body.tdate;
    var landingdate=req.body.ldate;
    var takeofftime=req.body.ttime;
    var landingtime=req.body.ltime;
    var totseats=60;
    tickprice=req.body.tickprice;
    var data = {
        "id":id,
        "name": name,
        "type":type,
        "takeoffloc" : takeoffloc,
        "landingloc": landingloc,
        "takeoffdate":takeoffdate,
        "landingdate" : landingdate,
        "takeofftime":takeofftime,
        "landingtime":landingtime,
        "tickprice":tickprice,
        "total_seats":totseats
    }

    db.collection('flights').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });
    return res.redirect('admin.html');
    }
)
//flight schema
const flightsSchema={

    id:Number,
    name:String,
    type:String,
    takeoffloc:String,
    landingloc:String,
    takeoffdate:Date,
    landingdate:Date,
    takeofftime:String,
    landingtime:String,
    total_seats:Number,
    tickprice:Number 
    
}
const Flight= mongoose.model('Flight',flightsSchema);

//removeflights

app.get('/',(req,res)=>{
    res.render('home.html');
})
app.get('/removeflights', (req, res) => {
  Flight.find({}).then(flights=>{
    console.log(flights);
      if (flights!=null)
      {
          res.render('removeflights', {flightsList : flights });
      }
  });
});
 //details schema
var totalamount;
var c;
var sid;

const detailsSchema={
    id:String,
    sid:[String],
    email:String,
    tickprice:String,
    traveldate:Date,
    amount:Number,
    tickcount:Number
    
}
const Detail = mongoose.model('Detail',detailsSchema);
 

//search
var origin;
var destination;
var takedate;
var taketime;
app.post("/searching",function(req,res){
    origin = req.body.selectpicker;
    destination = req.body.selectpicker1;
    takedate = req.body.date;
    taketime= req.body.time;
    console.log(origin);
    console.log(destination);
   
    check(req,res,origin,destination,taketime);
})
app.get('/flight',check);

function check(req,res,origin,destination,taketime)
  {
    Flight.find({takeoffloc:origin,landingloc:destination,takeofftime:taketime}).then(flights=>
        {
            
            if(flights!=null){
        
                res.render('flight',{
                 flightsList:flights,
                
                })
             }
         
             })
    }

app.get('/',(req,res)=>{
    res.render('home.html');
})


//delete

app.post("/remove",function(req,res){
     origin = req.body.takeoffloc;
    destination = req.body.landingloc;
    date = req.body.date;
    time= req.body.time;
    var data = {
        
        "takeoffloc" : origin,
        "landingloc": destination,

        
    }

    db.collection('flights').deleteOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        else{
            display1(req,res);
           console.log("Record deleted Successfully");
        
        }
    });
 
    }
        
)
app.get('/removeflights',display1)
    function display1(req,res){
        Flight.find({}).then(flights=>
            {
                console.log(flights);
                
                if(flights!=null){
            
                    res.render('removeflights',{
                     flightsList:flights,
                    
                    })
                }
            })
}

//delta
app.get('/delta', (req, res) => {
  Flight.find({name:"DELTA"}).then(flights=>{

      if (flights!=null)
      {
          res.render('delta', {flightsList : flights });
      }
  });
});


var id;
var takedate;
var taketime;
var tickprice;
app.post("/book",(req,res)=>{
    id=req.body.id;
    takedate=req.body.takeoffdate;
    tickprice=req.body.tickprice;
    taketime=req.body.takeofftime;
    checkdetail(req,res,takedate,taketime)
})
    
    app.get('/seat',checkdetail);
    
    function checkdetail(req,res,takeoffdate,takeofftime){
      
      Customer.findOne({email:email,login:1}).then(logins=>{
          
          console.log(logins);
          if(logins!=null){
              
              Detail.find({id:id}).then(seats =>{
                  console.log(seats);
                  res.render('seat',{
                      seatsList:seats
              })
          })
     
         /* Flight.findOne({id:id}).then(flights=>{
              if (flights!=null)
              {
                  res.render('seat',{flightsList:flights});
              }
          });*/
      }
      else{
          res.redirect('login.html')
      
        }
    })
      }  
    




//alliance

app.get('/alliance', (req, res) => {
    Flight.find({name:"ALLIANCE"}).then(flights=>{
    
        if (flights!=null)
        {
            res.render('alliance', {flightsList : flights });
        }
    });
  });

  var id;
  var takedate;
  var taketime;
  var tickprice;
  app.post("/book",(req,res)=>{
      id=req.body.id;
      takedate=req.body.takeoffdate;
      tickprice=req.body.tickprice;
      taketime=req.body.takeofftime;
      checkdetail(req,res,takedate,taketime)
  })
      
      app.get('/seat',checkdetail);
      
      function checkdetail(req,res,takeoffdate,takeofftime){
        
        Customer.findOne({email:email,login:1}).then(logins=>{
           
            console.log(logins);
            if(logins!=null){
                
                Detail.find({id:id}).then(seats =>{
                    console.log(seats);
                    res.render('seat',{
                        seatsList:seats
                })
            })
       
          /*  Flight.findOne({id:id}).then(flights=>{
                if (flights!=null)
                {
                    res.render('seat',{flightsList:flights});
                }
            });*/
        }
        else{
            res.redirect('login.html')
        
          }
      })
        }  
      
  
  
  //goair

  app.get('/goair', (req, res) => {
    Flight.find({name:"GO AIR"}).then(flights=>{
    
        if (flights!=null)
        {
            res.render('goair', {flightsList : flights });
        }
    });
  });
  
  var id;
  var takedate;
  var taketime;
  var tickprice;
  app.post("/book",(req,res)=>{
      id=req.body.id;
      takedate=req.body.takeoffdate;
      tickprice=req.body.tickprice;
      taketime=req.body.takeofftime;
      checkdetail(req,res,takedate,taketime)
  })
      
      app.get('/seat',checkdetail);
      
      function checkdetail(req,res,takeoffdate,takeofftime){
        
        Customer.findOne({email:email,login:1}).then(logins=>{
            
            console.log(logins);
            if(logins!=null){
                
                Detail.find({id:id}).then(seats =>{
                    console.log(seats);
                    res.render('seat',{
                        seatsList:seats
                })
            })
       
           /* Flight.findOne({id:id}).then(flights=>{
                if (flights!=null)
                {
                    res.render('seat',{flightsList:flights});
                }
            });*/
        }
        else{
            res.redirect('login.html')
        
          }
      })
        }  
      
  
  
  //indigo
  app.get('/indigo', (req, res) => {
    Flight.find({name:"INDIGO"}).then(flights=>{
  
        if (flights!=null)
        {
            res.render('indigo', {flightsList : flights });
        }
    });
  });
  
  var id;
  var takedate;
  var taketime;
  var tickprice;
  app.post("/book",(req,res)=>{
      id=req.body.id;
      takedate=req.body.takeoffdate;
      tickprice=req.body.tickprice;
      taketime=req.body.takeofftime;
      checkdetail(req,res,takedate,taketime)
  })
     
      app.get('/seat',checkdetail);
      
      function checkdetail(req,res,takeoffdate,takeofftime){
        
        Customer.findOne({email:email,login:1}).then(logins=>{
        
            console.log(logins);
            if(logins!=null){
                
                Detail.find({id:id}).then(seats =>{
                    console.log(seats);
                    res.render('seat',{
                        seatsList:seats
                })
            })
       
          /*  Flight.findOne({id:id}).then(flights=>{
                if (flights!=null)
                {
                    res.render('seat',{flightsList:flights});
                }
            });*/
        }
        else{
            res.redirect('login.html')
        
          }
      })
        }  
      
  
       
//logout
app.get('/logout',logopage)
function logopage(req,res){


    db.collection('customers').updateOne({email:email},{$set:{login:0}},(err,logins)=>{
             console.log('logout')
       

    })
    res.redirect('home.html');
}




console.log(email);
var totalbook=[];
totalamount=0;
c=0;
var bookid=[];
var sid;

app.post("/book1",(req,res)=>{
    console.log("hello");
     sid=req.body.id;
    var l=sid.length;
    bookid.push(sid);
    console.log(bookid);

    for(var i=0;i<l;i++){
        c=c+1;  
    }
    var amount=tickprice;
    console.log(tickprice);
     totalamount = amount * c; 
     console.log(amount);
     console.log(c);
    console.log(totalamount);
    var data={
        
        "id":id,
        "sid":sid,
        "email":email,
        "tickprice":tickprice,
        "ticketscount":c,
        "traveldate":takedate,
        "amount":totalamount
    }
    
    db.collection('details').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        else{
        console.log("record inserted successfully")     
        }
        return res.redirect('passenger');
    });

})

app.get('/passenger',function(req,res){
    Detail.find({id:id,email:email}).then(details=>{
       
        for(var i=0;i<details.sid;i++){
        console.log(details.sid[i]);
        }
            res.render('passenger',{detailsList:details,
            })
    })
})


//passenger page

app.get('/passenger',function(req,res){
    Detail.find({id:id,email:email}).then(details=>{
        
        for(var i=0;i<details.sid;i++){
        console.log(details.sid[i]);
        }
            res.render('passenger',{detailsList:details
            })
    })
})



app.post('/display1',function(req,res){
    var name=req.body.name;
    var contact=req.body.contact;
    var gender=req.body.selectpicker3;
    var age=req.body.age;
    var bookingdate=new Date()
    var boarding=req.body.selectpicker4;
    var drop=req.body.selectpicker5;
    var payment=req.body.selectpicker6;
    console.log('welcome');
    var data={
        "sid":sid,
        "id":id,
        "email":email,
        "amount":totalamount,
        "tickcount":c,
        "traveldate":takedate,
         "name":name,
         "contact":contact,
         "gender":gender,
         "age":age,
         "bookingdate":bookingdate,
         "takeoffloc":boarding,
         "landingloc":drop,
         "paymentmode":payment,
         "takeofftime":taketime
    }
    db.collection('bookings').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        else{
        console.log("record inserted successfully")     
        }
    });
    return res.render('confirm.html');
})


//bookings
const bookingsSchema={
    id:Number,
    sid:[String],
    email:String,
    amount:Number,
    tickcount:Number,
    traveldate:Date,
    name:String,
    contact:String,
    gender:String,
    age:String,
    bookingdate:Date,
    takeoffloc:String,
    landingloc:String,
    paymentmode:String,
    takeofftime:String
}
const Booking = mongoose.model('Booking',bookingsSchema);
 
app.get('/bookings',function(req,res){
    Booking.find({email:email}).then(bookings=>{
        if (bookings!=null)
            {
                res.render('bookings',{bookingsList:bookings});
            }
        });
      
  })
 
  //all bookings


 
app.get('/allbookings',function(req,res){
    Booking.find({}).then(bookings=>{
        if (bookings!=null)
            {
                res.render('allbookings',{bookingsList:bookings});
            }
        });
      
  })


app.get('/',function(req,res){
    res.set({
        'Access-control-Allow-Origin': '*'
        });
    return res.redirect('home.html');
    }).listen(7088)
    console.log("server listening!");

