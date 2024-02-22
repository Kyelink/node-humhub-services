const { MIMEType } = require('util');


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
        this.iddtype = config.iddtype;
        this.idd = config.idd;
        
        
        node.on('input', function(msg) {
            
			if(config.iddtype === "msg"){
				var buildText = eval("msg." + config.idd)
				this.idd = buildText;
            }else if(config.iddtype === "flow"){
                this.idd = this.context().flow.get(config.idd);
			}else if(config.iddtype === "global"){
                this.idd = this.context().global.get(config.idd);
			}else{
				this.idd = config.idd;
			}

            this.contentType = config.contentType;

            var url='https://'+this.creds.host+'/api/v1/';
                
            
            
            
                let headers = new Headers();
                if(this.creds.authentification==="Token"){
                    headers.set('Authorization', 'Bearer ' + this.creds.bearer_token);
                }
                else{
                    headers.set('Authorization', 'Basic ' + btoa(this.creds.username + ":" + this.creds.password));
                }
                let meth=this.method;


                switch(this.contentType)
                {
                    case 'files':
                        const fs = require('fs');
                    //    const {exec} = require('child_process'); 
                       const mime = require('mime-types');
                       const axios = require('axios');
                        switch (meth) {
                            case "POST":
                              
                                let valueTemp="";
                                switch(config.postPayload[0].type){
                                    case "str":
                                        valueTemp=config.postPayload[0].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=config.postPayload[0].value;                               
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + config.postPayload[0].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(config.postPayload[0].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(config.postPayload[0].value);
                                        break                         
                                    default:
                                        break;
                                }
                                let fileName=valueTemp;
                                switch(config.postPayload[1].type){
                                    case "str":
                                        valueTemp=config.postPayload[1].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=config.postPayload[1].value;                               
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + config.postPayload[1].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(config.postPayload[1].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(config.postPayload[1].value);
                                        break                         
                                    default:
                                        break;
                                }
                                let idToPost=valueTemp;

                                url+="post/";
                                url+=idToPost;
                                url+="/upload-files"
                                var formdata = new FormData();
                                // let mt="";
                                // exec(`file --mime-type -b "${fileName}"`,(err, stdout, stderr)=>{
                                //     if(err){console.error(err);}
                                //     else{
                                //         mt=stdout.trim();
                                //         console.log("mime type : "+mt);
                                //         file=fs.openAsBlob(fileName,{ type: mt }).then(f=>{
                                //             formdata.append("files",f, fileName);
                                //             console.log(formdata);
                                //             console.log(f.type);
                                //             var requestOptions = {
                                //                 method: 'POST',
                                //                 headers: headers,
                                //                 body: formdata,
                                //                 redirect: 'follow'
                                //               };
                                              
                                //               fetch(url, requestOptions)
                                //                 .then(response => response.json())
                                //                 .then(json=>{msg.payload=json;node.send(msg);})
                                                    
                                //         });
                                //     }

                                // })
                                let mt=mime.lookup(fileName);
                                file=fs.openAsBlob(fileName,{ type: mt }).then(f=>{
                                                formdata.append("files",f, fileName);
                                                console.log(formdata);
                                                console.log(f.type);
                                                var requestOptions = {
                                                    method: 'POST',
                                                    headers: headers,
                                                    body: formdata,
                                                    redirect: 'follow'
                                                  };
                                                  
                                                  fetch(url, requestOptions)
                                                    .then(response => response.json())
                                                    .then(json=>{msg.payload=json;node.send(msg);})
                                                        
                                            });
                                

                                
                                break;
                            
                            case "GET":
                                url+="file/download/";
                                let idToDL="";
                                switch(config.iddtype){
                                    case "str":
                                        idToDL=config.idd;                                    
                                        break;
                                    case "num":
                                        idToDL=config.idd;                               
                                        break;
                                    case "msg":
                                        idToDL=eval("msg." + config.idd);
                                        break
                                    case "flow":
                                        idToDL= this.context().flow.get(config.idd);
                                        break
                                    case "global":
                                        idToDL= this.context().global.get(config.idd);
                                        break                         
                                    default:
                                        break;
                                }
                                url+=idToDL;
                                let path="";
                                switch(config.pathtype){
                                    case "str":
                                        path=config.path;                                    
                                        break;
                                    case "num":
                                        path=config.path;                               
                                        break;
                                    case "msg":
                                        path=eval("msg." + config.path);
                                        break
                                    case "flow":
                                        path= this.context().flow.get(config.path);
                                        break
                                    case "global":
                                        path= this.context().global.get(config.path);
                                        break                         
                                    default:
                                        break;
                                }

                                let vtemp = '';
                                if(this.creds.authentification==="Token"){
                                    vtemp='Bearer ' + this.creds.bearer_token;
                                }
                                else{vtemp='Basic ' + btoa(this.creds.username + ":" + this.creds.password);}
                                let configuration = {
                                    method: 'get',
                                    maxBodyLength: Infinity,
                                    url: url,
                                    headers: { 
                                        'Authorization': vtemp
                                      },
                                    responseType: "arraybuffer"
                                  };
                                  
                                  axios.request(configuration)
                                  .then((res)=>{
                                    const buffer=Buffer.from(res['data']);
                                  
                                      const ext= mime.extension(res['headers'].get('content-type'));
                                      fs.writeFile(path+'.'+ext,buffer, err=>{if(err){msg.payload=err;node.error(msg);}else{msg.payload=res.statusText;node.send(msg);}});
                                  
                                   
                                    
                                  })
                                  .catch((error) => {
                                    msg.payload=error;node.error(msg);
                                  });
                                   
                                        


                                break;
                        
                            default:
                                break;
                        }

                        break;

                    case 'posts':
                        url+="post";
                        switch (meth) {
                        case 'DELETE':
                            url+='/';
                            url+=this.idd;
                            var options = {
                                method : this.method,
                                headers : headers
                            };
                            const promiseJson3= fetch(url,options)
                            .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                return response.json();});
                            break;

                        case 'GET':
                            var options = {
                                method : this.method,
                                headers : headers
                            };
                            const promiseJson2= fetch(url,options)
                            .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                return response.json();});
                            promiseJson2.then((json) => console.log(json));
                            promiseJson2.then(function(json){
                                tempResults=json.results;
                                this.filters = config.filters;
                                
                                for(let i=0;i<this.filters.length;i++){
                                    //implement filters by other params than id
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
                                    }}
                                   
                                }
        
                                msg.payload=tempResults;
        
                            
    
                            console.log("input treated")
                            node.send(msg);

                            });

                            
                            break;
                        case 'PUT':
                            
                            headers.set('Content-Type', 'application/json; charset=UTF-8');
                            url+="/";
                            url+=this.idd;
                            const putPayload = config.putPayload;
                            const putPosts=[["message","string"],["scheduled_at","string"],["topics","stringArray"]].map(x=>x[0]);
                            
                            let bodyPUT = {"data":{
                                "message":"",
                                "content":{
                                    "metadata":{
                                        
                                    },
                                    "topics":[]
                                }
                            }};
                            console.log("put read2");
                            for(let i=0;i<putPayload.length;i++){
                                console.log("put start of loop "+i);
                                let valueTemp="";
                                switch(putPayload[i].type){
                                    case "str":
                                        valueTemp=putPayload[i].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=putPayload[i].value;                                    
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + putPayload[i].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(putPayload[i].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(putPayload[i].value);
                                        break                         
                                    default:
                                        break;
                                }
                                console.log("put mid of loop "+i);
                                switch (putPosts[i]) {
                                    
                                    case "message":
                                        bodyPUT["data"][putPosts[i]]=valueTemp;
                                        break
                                    case "scheduled_at":
                                        
                                        bodyPUT["data"]["content"]["metadata"][putPosts[i]]=valueTemp;
                                        break
                                    case "topics":
                                        bodyPUT["data"]["content"][putPosts[i]]=[{"name":valueTemp}];
                                        break
                                
                                    default:
                                        break;
                                }
                                console.log("put end of loop "+i);

                            }
                            console.log("put read3");

                            options = {
                                method : this.method,
                                headers : headers,
                                body : JSON.stringify(bodyPUT)};
                                
                            const promiseJson4= fetch(url,options)
                            .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                return response.json();});
                            promiseJson4.then(function(json){console.log(json);
                            msg.payload=json;
                            node.send(msg);
                            });



                            


                            break;
                            
                        case 'POST':
                            url+="/container/";
                            
                            const postPosts=[["container id","string"],["message","string"],["scheduled_at","string"],["topics","stringArray"]]
                            .map(x=>x[0]);
                            headers.set('Content-Type', 'application/json; charset=UTF-8');
                            let postPayload = config.postPayload;
                            let body = {"data":{
                                "content":{
                                    "metadata":{}
                                }
                            }};
                                                
                            for(let i=0;i<postPayload.length;i++){
                                let valueTemp="";
                                switch(postPayload[i].type){
                                    case "str":
                                        valueTemp=postPayload[i].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=postPayload[i].value;                                    
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + postPayload[i].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(postPayload[i].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(postPayload[i].value);
                                        break                         
                                    default:
                                        break;
                                }
                                switch (postPosts[i]) {
                                    case "container id":
                                        url+=valueTemp;
                                        
                                        break;
                                    case "message":
                                        body["data"][postPosts[i]]=valueTemp;
                                        break
                                    case "scheduled_at":
                                        
                                        body["data"]["content"]["metadata"][postPosts[i]]=valueTemp;
                                        break
                                    case "topics":
                                        body["data"]["content"][postPosts[i]]=[{"name":valueTemp}];
                                        break
                                
                                    default:
                                        break;
                                }

                            }

                            options = {
                                method : this.method,
                                headers : headers,
                                body : JSON.stringify(body)};
                               
                            const promiseJson= fetch(url,options)
                            .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                return response.json();});
                            promiseJson.then(function(json){console.log(json);
                            msg.payload=json;
                            node.send(msg);
                        });
                     
                            
                            
                        
                            
                            break;
                    
                        default:
                            break;
                        }
                        break;

                    case 'comments':
                        url+="comment";
                        switch (meth) {
                            case 'DELETE':
                                url+='/';
                                url+=this.idd;
                                var options = {
                                    method : this.method,
                                    headers : headers
                                };
                                const promiseJson= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                    break;
                            case 'POST':
                        
                                headers.set('Content-Type', 'application/json; charset=UTF-8');
                                let postPayload = config.postPayload;
                                                          
                                                    
                                
                                let valueTemp="";
                                switch(postPayload[0].type){
                                    case "str":
                                        valueTemp=postPayload[0].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=postPayload[0].value;                                    
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + postPayload[0].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(postPayload[0].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(postPayload[0].value);
                                        break                         
                                    default:
                                        break;
                                }
                                const idOfPost=valueTemp;
                                switch(postPayload[1].type){
                                    case "str":
                                        valueTemp=postPayload[1].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=postPayload[1].value;                                    
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + postPayload[1].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(postPayload[1].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(postPayload[1].value);
                                        break                         
                                    default:
                                        break;
                                }
                                let body = {
                                    "objectModel": "humhub\\modules\\post\\models\\Post",
                                    "objectId": idOfPost,
                                    "Comment": {
                                    "message": valueTemp
                                    }
                                };

                                



                                var options = {
                                    method : this.method,
                                    headers : headers,
                                    body : JSON.stringify(body),
                                };
                                const promiseJson2= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                    break;

                            case 'PUT':
                                url+='/';
                                url+=this.idd;
                                headers.set('Content-Type', 'application/json; charset=UTF-8');
                                let putPayload = config.putPayload;
                                                            
                                                    
                                
                                let messagePut="";
                                switch(putPayload[0].type){
                                    case "str":
                                        messagePut=putPayload[0].value;                                    
                                        break;
                                    case "num":
                                        messagePut=putPayload[0].value;                                    
                                        break;
                                    case "msg":
                                        messagePut=eval("msg." + putPayload[0].value);
                                        break
                                    case "flow":
                                        messagePut= this.context().flow.get(putPayload[0].value);
                                        break
                                    case "global":
                                        messagePut= this.context().global.get(putPayload[0].value);
                                        break                         
                                    default:
                                        break;
                                }
                                
                                let bodyPutComment = {
                                    "Comment": {
                                    "message": messagePut
                                    }
                                };

                                



                                var options = {
                                    method : this.method,
                                    headers : headers,
                                    body : JSON.stringify(bodyPutComment),
                                };
                                const promiseJson3= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                break;
                            
                            case 'GET':
                                switch(config.commentIdType){
                                    case 'comment id':
                                        url+='/';
                                        url+=this.idd;

                                        break;
                                    case 'post id':
                                        url+='/find-by-object?objectModel=humhub\\modules\\post\\models\\Post&objectId=';
                                        url+=this.idd;
                                        break;
                                    case 'content id':
                                        url+='/content/';
                                        url+=this.idd;
                                        break;
                                    default:
                                        break;
                                }
                                var options = {
                                    method : this.method,
                                    headers : headers,
                                };
                                const promiseJson4= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                break;
                                




                                break;
                            default:
                                break;
                        }
                        break;
                    
                    case 'topics':
                        url+="topic";
                        switch (meth) {
                            case 'DELETE':
                                url+='/';
                                url+=this.idd;
                                var options = {
                                    method : this.method,
                                    headers : headers
                                };
                                const promiseJson= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                    break;
                            case 'POST':
                                url+='/container/';
                                
                                headers.set('Content-Type', 'application/json; charset=UTF-8');
                                let postPayload = config.postPayload;
                                                            
                                                    
                                
                                let valueTemp="";
                                switch(postPayload[0].type){
                                    case "str":
                                        valueTemp=postPayload[0].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=postPayload[0].value;                                    
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + postPayload[0].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(postPayload[0].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(postPayload[0].value);
                                        break                         
                                    default:
                                        break;
                                }
                                url+=valueTemp;
                                switch(postPayload[1].type){
                                    case "str":
                                        valueTemp=postPayload[1].value;                                    
                                        break;
                                    case "num":
                                        valueTemp=postPayload[1].value;                                    
                                        break;
                                    case "msg":
                                        valueTemp=eval("msg." + postPayload[1].value);
                                        break
                                    case "flow":
                                        valueTemp= this.context().flow.get(postPayload[1].value);
                                        break
                                    case "global":
                                        valueTemp= this.context().global.get(postPayload[1].value);
                                        break                         
                                    default:
                                        break;
                                }
                                let body = {
                                    
                                    "name": valueTemp
                                    
                                };

                                



                                var options = {
                                    method : this.method,
                                    headers : headers,
                                    body : JSON.stringify(body),
                                };
                                const promiseJson2= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                break;

                            case 'PUT':
                                url+='/';
                                url+=this.idd;
                                headers.set('Content-Type', 'application/json; charset=UTF-8');
                                let putPayload = config.putPayload;
                                                            
                                                    
                                
                                let messagePut="";
                                switch(putPayload[0].type){
                                    case "str":
                                        messagePut=putPayload[0].value;                                    
                                        break;
                                    case "num":
                                        messagePut=putPayload[0].value;                                    
                                        break;
                                    case "msg":
                                        messagePut=eval("msg." + putPayload[0].value);
                                        break
                                    case "flow":
                                        messagePut= this.context().flow.get(putPayload[0].value);
                                        break
                                    case "global":
                                        messagePut= this.context().global.get(putPayload[0].value);
                                        break                         
                                    default:
                                        break;
                                }
                                
                                let bodyPutComment = {
                                    
                                    "name": messagePut
                                    
                                };

                                



                                var options = {
                                    method : this.method,
                                    headers : headers,
                                    body : JSON.stringify(bodyPutComment),
                                };
                                const promiseJson3= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                break;
                            
                            case 'GET':
                                switch(config.topicIdType){
                                    case 'all topics':
                                        
                                        

                                        break;
                                    case 'topic id':
                                        url+='/';

                                        if(config.idd2type === "msg"){
                                            var buildText = eval("msg." + config.idd2)
                                            this.idd2 = buildText;
                                        }else if(config.idd2type === "flow"){
                                            this.idd2 = this.context().flow.get(config.idd2);
                                        }else if(config.idd2type === "global"){
                                            this.idd2 = this.context().global.get(config.idd2);
                                        }else{
                                            this.idd2 = config.idd2;
                                        }

                                        url+=this.idd2;
                                        break;
                                    case 'container id':
                                        url+='/container/';

                                        if(config.idd2type === "msg"){
                                            var buildText = eval("msg." + config.idd2)
                                            this.idd2 = buildText;
                                        }else if(config.idd2type === "flow"){
                                            this.idd2 = this.context().flow.get(config.idd2);
                                        }else if(config.idd2type === "global"){
                                            this.idd2 = this.context().global.get(config.idd2);
                                        }else{
                                            this.idd2 = config.idd2;
                                        }

                                        url+=this.idd2;
                                        break;
                                    default:
                                        break;
                                }
                                var options = {
                                    method : this.method,
                                    headers : headers,
                                };
                                const promiseJson4= fetch(url,options)
                                .then((response) => {if (!response.ok){node.error(response.statusText + ", status code : (" + response.status+")");}
                                    return response.json();})
                                .then((res)=>{msg.payload=res;node.send(msg);})
                                break;
                                




                                
                            default:
                                break;
                        }
                        break;
                    default:
                        break;  
                }
               


        });
    }
    RED.nodes.registerType("humhub-services",LowerCaseNode);

    
}

