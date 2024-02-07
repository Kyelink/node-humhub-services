

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


            var url='https://'+this.creds.host+'/api/v1/post';
            
            
            
                let headers = new Headers();
                if(this.creds.authentification==="Token"){
                    headers.set('Authorization', 'Bearer ' + this.creds.bearer_token);
                }
                else{
                    headers.set('Authorization', 'Basic ' + btoa(this.creds.username + ":" + this.creds.password));
                }
                let meth=this.method;
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
                                switch (fO) {
                                    case "===":
                                        tempResults=tempResults.filter(x=>x[fK]==fV);
                                        break;
    
                                    case "!==":
                                        tempResults=tempResults.filter(x=>x[fK]!=fV);
                                        break;
    
                                    case ">":
                                        tempResults=tempResults.filter(x=>x[fK]>fV);
                                        break;
    
                                    case "<":
                                        tempResults=tempResults.filter(x=>x[fK]<fV);
                                        break;
    
                                    case ">=":
                                        tempResults=tempResults.filter(x=>x[fK]>=fV);
                                        break;
    
                                    case "<=":
                                        tempResults=tempResults.filter(x=>x[fK]<=fV);
                                        break;
                                
                                    default:
                                        break;
                                }
                                
    
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
                        for(let i=0;i<putPayload.length;i++){
                            let valueTemp="";
                            switch(putPayload[i].type){
                                case "str":
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

                        }

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



                    
                    
                    
                    
                    


             
                
                
               
                
            

        });
    }
    RED.nodes.registerType("humhub-services",LowerCaseNode);

    
}