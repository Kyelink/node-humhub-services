module.exports = function(RED) {

    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.username = n.username;
        this.password = n.password;
        this.bearer_token = n.bearer_token;
        this.host = n.host;
        this.authentification = n.authentification;
    }
    RED.nodes.registerType("client-credentials",RemoteServerNode);


    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.creds = RED.nodes.getNode(config.creds);
        this.method = config.method;
        this.content = config.content;
        
        node.on('input', function(msg) {

            const content = config.content;
            const method = config.method;
            var url='https://'+this.creds.host+'/api/v1/';
            const baseUrl=url;
            let headers = new Headers();
            if(this.creds.authentification==="Token"){
                headers.set('Authorization', 'Bearer ' + this.creds.bearer_token);
            }
            else{
                headers.set('Authorization', 'Basic ' + btoa(this.creds.username + ":" + this.creds.password));
            }
            let payloadObject={};
            config.complexPayload.map(x=>{
                var valueTemp="";
                if(x['type'] === "msg"){
                    valueTemp= eval("msg." + x['value'])
                }else if(x['type'] === "flow"){
                    valueTemp = this.context().flow.get(x['value']);
                }else if(x['type'] === "global"){
                    valueTemp = this.context().global.get(x['value']);
                }else{
                    valueTemp = x['value'];
                }
                payloadObject[x['name']]=valueTemp;
            });
            let res="";
            let requestOptions={};
            (async()=>{
                try{
                    switch (content) {
                        case 'files':
                            const fs = require('fs');
                            const mime = require('mime-types');
                            switch (method) {
                                case 'GET ONE':
                                    const axios = require('axios');  
                                    url+="file/download/";
                                    let idToDL=payloadObject["File's id"];
                                    url+=idToDL;
                                    let path=payloadObject["Destination's path"];
                                    let vtemp = '';
                                    if(this.creds.authentification==="Token"){
                                        vtemp='Bearer ' + this.creds.bearer_token;
                                    }
                                    else{vtemp='Basic ' + btoa(this.creds.username + ":" + this.creds.password);}
                           
                                    console.log(vtemp);
                                    requestOptions = {
                                        method: 'get',
                                        maxBodyLength: Infinity,
                                        url: url,
                                        headers: { 
                                                    'Authorization': vtemp
                                                    },
                                        responseType: "arraybuffer"
                                    };
                                    
                                    res = await axios.request(requestOptions);
                                    
                                    const buffer=Buffer.from(res['data']);
                                    if(path!=""){const ext= mime.extension(res['headers'].get('content-type'));
                                    fs.writeFile(path+'.'+ext,buffer, err=>{
                                        if(err){node.error(err);}});}
                                    msg.payload=res;
                                    node.send(msg);
                                
                                   
                                    break;
                                
                                case "UPLOAD":
                                    let fileName=payloadObject["File's path"];
                                    let idToPost=payloadObject["Post's id"];
                                    url+="post/";
                                    url+=idToPost;
                                    url+="/upload-files"
                                    var formdata = new FormData();
                
                                    let mt=mime.lookup(fileName);
                                    let file= await fs.openAsBlob(fileName,{ type: mt });
                                    formdata.append("files",file, fileName);
                                    requestOptions = {
                                        method: 'POST',
                                        headers: headers,
                                        body: formdata,
                                        redirect: 'follow'
                                        };          
                                    res = await fetch(url, requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res; 
                                        node.send(msg);
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;
                        
                        case 'posts':
                            url+="post";
                            switch (method) {
                                case 'GET ALL & FILTER':
                                    requestOptions = {
                                        method : "GET",
                                        headers : headers
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        tempResults=res.results;
                                        this.filters = config.filters;
                                        for(let i=0;i<this.filters.length;i++){
                                            let fK=this.filters[i].filterKey;
                                            let fO=this.filters[i].filterOperator;
                                            let fV="";
                                            if(this.filters[i].filterValueType === "msg"){
                                                fV = eval("msg." + this.filters[i].filterValue)
                                            }else if(this.filters[i].filterValueType === "flow"){
                                                fV = this.context().flow.get(this.filters[i].filterValue);
                                            }else if(this.filters[i].filterValueType === "global"){
                                                fV= this.context().global.get(this.filters[i].filterValue);
                                            }else{
                                                fV = this.filters[i].filterValue;
                                            }
                                            
                                            let valuesToCompare=tempResults;
                                            switch(fK){
                                                case "Id":
                                                    valuesToCompare=tempResults.map(x=>x['id']);
                                                    break;
                                                case "Message's length":
                                                    valuesToCompare=tempResults.map(x=>x['message'].length);
                                                    break;
                                                case "Likes":
                                                    valuesToCompare=tempResults.map(x=>x['content']['likes']['total']);
                                                    break;
                                                case "Topics number":
                                                    valuesToCompare=tempResults.map(x=>x['content']['topics'].length);
                                                    break;
                                                case "Files number":
                                                    valuesToCompare=tempResults.map(x=>x['content']['files'].length);
                                                    break;
                                                case "Comments number":
                                                    valuesToCompare=tempResults.map(x=>x['content']['comments']['total']);
                                                    break;
                                                case "Topics":
                                                    valuesToCompare=tempResults.map(x=>x['content']['topics'].map(y=>y['name']));
                                                    break;
                                                case "Message containing":
                                                    valuesToCompare=tempResults.map(x=>x['message']);
                                                    break;
                                                default:
                                                    break;
                                            }
                                            if(fK==='Topics'||fK==='Message containing'){
                                                
                                                tempResults=tempResults.filter((x,i)=>valuesToCompare[i].includes(fV));
                                                
                                            }
                                            else{
                                                switch (fO) {
                                                    case "===":
                                                        tempResults=tempResults.filter((x,i)=>valuesToCompare[i]==fV);
                                                        break;
                    
                                                    case "!==":
                                                        tempResults=tempResults.filter((x,i)=>valuesToCompare[i]!=fV);
                                                        break;
                    
                                                    case ">":
                                                        tempResults=tempResults.filter((x,i)=>valuesToCompare[i]>fV);
                                                        break;
                    
                                                    case "<":
                                                        tempResults=tempResults.filter((x,i)=>valuesToCompare[i]<fV);
                                                        break;
                    
                                                    case ">=":
                                                        tempResults=tempResults.filter((x,i)=>valuesToCompare[i]>=fV);
                                                        break;
                    
                                                    case "<=":
                                                        tempResults=tempResults.filter((x,i)=>valuesToCompare[i]<=fV);
                                                        break;
                                                
                                                    default:
                                                        break;
                                                }
                                            }
                                       
                                        }
                                        msg.payload=tempResults;
                                        node.send(msg);
                                    }
                                    
                                    break;
                                case "GET ONE":
                                    url+="/"
                                    url+=payloadObject["Post's id"];
                                    requestOptions = {
                                        method : "GET",
                                        headers : headers
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                case "DELETE":
                                    
                                    url+='/';
                                    url+=payloadObject["Post's id"];
                                    requestOptions = {
                                        method : "DELETE",
                                        headers : headers
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;

                                case "UPDATE":
                                    //add functionnalities to add or remove topics as array
                                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                                    url+='/';
                                    url+=payloadObject["Post's id"];
                                    let bodyPUT = {
                                        "data":{
                                                "message":"",
                                                "content":{
                                                    "metadata":{
                                                        
                                                    },
                                                    "topics":[]
                                                }
                                            }};
                                    bodyPUT["data"]["message"]=payloadObject["Message"];
                                    bodyPUT["data"]["content"]["metadata"]["scheduled_at"]=payloadObject["Scheduled at"];
                                    bodyPUT["data"]["content"]["topics"]=[{"name":payloadObject["Topics"]}];
                                
                                    requestOptions = {
                                        method : "PUT",
                                        headers : headers,
                                        body : JSON.stringify(bodyPUT),
                                    }
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                case "CREATE":
                                    url+="/container/";
                                    url+=payloadObject["Container's id"];
                                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                                    let body = {"data":{
                                        "content":{
                                            "metadata":{}
                                        }
                                    }};
                                    body["data"]["message"]=payloadObject["Message"];
                                    body["data"]["content"]["metadata"]["scheduled_at"]=payloadObject["Scheduled at"];
                                    body["data"]["content"]["topics"]=[{"name":payloadObject["Topics"]}];

                                    requestOptions = {
                                        method : "POST",
                                        headers : headers,
                                        body : JSON.stringify(body)
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;
                            
                        case 'comments':
                            url+="comment"
                            switch (method) {
                                
                                case 'GET ONE BY ID':
                                    url+='/';
                                    url+=payloadObject["Comment's id"];
                                    requestOptions = {
                                        method : "GET",
                                        headers : headers,
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }               
                                    break;
                                case 'GET ALL BY POST':
                                    url+='/find-by-object?objectModel=humhub\\modules\\post\\models\\Post&objectId=';
                                    url+=payloadObject["Post's id"];
                                    requestOptions = {
                                        method : "GET",
                                        headers : headers,
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }               
                                    break;
                                case 'GET ALL BY OBJECT':
                                    url+='/content/';
                                    url+=payloadObject["Object's id"];
                                    requestOptions = {
                                        method : "GET",
                                        headers : headers,
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }               
                                    break;
                                case 'CREATE':
                                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                                    let body = {
                                        "objectModel": "humhub\\modules\\post\\models\\Post",
                                        "objectId": payloadObject["Post's id"],
                                        "Comment": {
                                        "message": payloadObject["Message"]
                                        }
                                    };
                                    requestOptions = {
                                        method : "POST",
                                        headers : headers,
                                        body : JSON.stringify(body),
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                
                                case 'UPDATE':
                                    url+='/';
                                    url+=payloadObject["Comment's id"];
                                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                                    let bodyPutComment = {
                                        "Comment": {
                                        "message": payloadObject["Message"]
                                        }
                                    };
                                    requestOptions = {
                                        method : "PUT",
                                        headers : headers,
                                        body : JSON.stringify(bodyPutComment),
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                case 'DELETE':
                                    url+='/';
                                    url+=payloadObject["Comment's id"];
                                    requestOptions = {
                                        method : "DELETE",
                                        headers : headers
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                default:
                                    break;
                            }
                            break;

                        case 'topics':
                            url+="topic";
                            switch (method) {
                                case 'GET ALL':
                                    requestOptions = {
                                        method : "GET",
                                        headers : headers
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                case 'DELETE':
                                    url+='/';
                                    url+=payloadObject["Topic's id"];
                                    requestOptions = {
                                        method : "DELETE",
                                        headers : headers
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                case 'CREATE':
                                    url+='/container/';
                                    url+=payloadObject["Container's id"]
                                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                                    let body = {
                                        "name": payloadObject["Topic's name"]
                                    };
                                    requestOptions = {
                                        method : "POST",
                                        headers : headers,
                                        body : JSON.stringify(body),
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                case 'UPDATE':
                                    url+='/';
                                    url+=payloadObject["Topic's id"];
                                    headers.set('Content-Type', 'application/json; charset=UTF-8');
                                    let bodyPutComment = {
                                        "name": payloadObject['New name'] 
                                    };
                                    requestOptions = {
                                        method : "PUT",
                                        headers : headers,
                                        body : JSON.stringify(bodyPutComment),
                                    };
                                    res = await fetch(url,requestOptions);
                                    if(!res.ok){
                                        node.error("fetch response not ok : "+res.statusText)}
                                    else{
                                        res = await res.json();
                                        msg.payload=res;
                                        node.send(msg);
                                    }
                                    break;
                                default:
                                    break;
                            }
                                
                                
                            
                            break;
                        
                        default:
                            break;
                    }
                }
                catch(e){
                    node.error(e+" "+e.cause)};
            })();
        });
    }
    RED.nodes.registerType("humhub-services",LowerCaseNode);

    
}

