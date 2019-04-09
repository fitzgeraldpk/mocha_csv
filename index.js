const csv=require('csvtojson');
const assert=require('chai').assert;
var testArray=[];
const request=require('request');
const testArgs = require('commander');

testArgs.version('0.1.0')
.option('-p, --path <path>')
.option('-h, --host <host>')
.parse(process.argv);

const host ='http://'+testArgs.host;
describe("asynchronously dynamically generated tests", function() {
    csv()
    .fromFile(testArgs.path)
    .then((arr)=>{
        testArray=arr;
        testArray.forEach(function(testObj) {
            it(testObj['Test Name'], function(done) {
                if (testObj['Type']==='POST'){
                    var requestBody= JSON.parse(testObj['Request Body']);
                }
                let headerArray = Object.keys(testObj);
                let tests=[];

                headerArray.forEach(function(header){
                    if (header.includes('Assertion')){
                        if (testObj[header]){
                            tests.push({"test":header,
                                        "actualLabel":testObj[header].split("=")[0].trim(),
                                        "actual":"",
                                        "expected":testObj[header].split("=")[1].trim()});
                        }
                    }
                });
                
               if (testObj['Type']==='POST'){
                    request.post({url:host+testObj['Request URL'], json: requestBody}, function cb(err, httpResponse, body) {
                        if (err) {
                            console.error(err);
                        }
                        const rep=JSON.parse(JSON.stringify(body));
                        rep.statusCode=httpResponse.statusCode;
                        tests.forEach(function(testAssertion){
                            context(testAssertion.test,function(){
                                this.timeout(10000);
                                testAssertion.actual=rep[testAssertion.actualLabel];
                                assert.equal(testAssertion.actual,testAssertion.expected);        
                            })                                  
                        })
                        done();
                    });
                }else{
                    request.get({url:host+testObj['Request URL']},function cb(err, httpResponse, body){
                        if (err) {
                            console.error(err);
                        }
                        const rep=  JSON.parse(body);
                        rep.statusCode=httpResponse.statusCode;
                        tests.forEach(function(testAssertion){
                            context(testAssertion.test,function(){
                                this.timeout(10000);
                                testAssertion.actual=rep[testAssertion.actualLabel];
                                assert.equal(testAssertion.actual,testAssertion.expected);      
                        })
                        })
                        done();
                    })
                }
            });
        });   
        run();   
    });   
}); 
