# node-red-contrib-humhub-services

![Platform](https://img.shields.io/badge/platform-Node--RED-red)
![npm](https://img.shields.io/npm/v/@tec6/node-red-humhub-services?color=blue)
![Downloads](https://img.shields.io/npm/dt/@tec6/node-red-humhub-services?color=green)
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

Implement your Node-RED flows with the services proposed by the RESTful API of Humhub.

**Warning: Beta version - Humhub-services will change in the next releases!**

The REST API module provides a generic interface to various subsystems of the HumHub platform.

## Requirements

Ensure you created an Humhub account in order to correctly configure your credentials, either by login/password or with API token/key.

# Creating a post (POST method)

To create a post, you'll need the container's id in which you want to have your post. GET method can get you the container id of a particular post.

# Updating a post (PUT method)

To update a post, you'll need the id of the post you want to change. GET method can get you the id of a particular post.

# Deleting a post (DELETE method)

To delete a post, you'll need the id of the post you want to erase. GET method can get you the id of a particular post.

# Getting one or many post (GET method)

To get all the posts, you can set no filter. If you want to have only some, you can set as many filters as you need. Filters have only few conditions to examine and compare, they'll be enhanced in subsequent versions.

# Uploading a file (POST method)

To upload a file on a post, you'll need the post's id in which you want to have your file. Posts GET method can get you the id of a particular post. You'll also need to provide the full path of your file.

# Downloading a file (GET method)

To download a file, you'll need it's id. You'll also need to provide the full path of where you want to create your file. The extension will be auto generated from the mime-type of your file.

# Creating a comment (POST method)

To create a comment, you'll need the post's id in which you want to have your comment. You'll write it in the "message" property.

# Updating a comment (PUT method)

To update a comment, you'll need its id. You'll write the updated comment in the "message" property.

# Deleting a comment (DELETE method)

To delete a post, you'll need the id of the post you want to erase.

# Getting one or many comment (GET method)

To get the comments you'll need to provide an Id, either one of a particular comment, or one of a post, or one of a content.

# Creating a topic (POST method)

To create a topic, you'll need the container's id in which you want to have your topic. You'll also need to provide its name.

# Updating a topic (PUT method)

To update a topic, you'll need its id. You'll write the updated topic in the "new name" property.

# Deleting a topic (DELETE method)

To delete a topic, you'll need the id of the topic you want to erase.

# Getting one or many topics (GET method)

To get the topics you can provide an Id, either one of a particular topic, or one of a container, you can also choose to get all the topics without providing any id.

## Installation

In order to set an API access go to `Administration -> Modules on your Humhub account.

![humhub1](https://github.com/Kyelink/node-humhub-services/assets/143307261/97824401-cd6b-478e-8084-1ef5d453f18c)

![humhub2](https://github.com/Kyelink/node-humhub-services/assets/143307261/e1d7c00f-abee-42cb-a8a8-71e0426da193)

Then install the restful API module, and click on configure in order to set an access with basic authentification or bearer token.

![humhub3](https://github.com/Kyelink/node-humhub-services/assets/143307261/7093b119-9e0c-411a-babd-a59e6abf744e)

Under "General" choose to allow the access method you want to use.

![humhub4](https://github.com/Kyelink/node-humhub-services/assets/143307261/75028c73-7d05-44b1-b9aa-14da4abaa318)

If you want to setup an access via bearer token, generate one in the "Bearer Auth" tab, and provide your account as an authorized user. Then you'll just have to add your token in your credentials node.

![humhub5](https://github.com/Kyelink/node-humhub-services/assets/143307261/d20911c4-fc74-47bf-826e-197de12def72)




