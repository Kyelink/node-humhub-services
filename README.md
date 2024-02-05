# node-red-contrib-humhub-services

![Platform](https://img.shields.io/badge/platform-Node--RED-red)
![npm](https://img.shields.io/badge/npm-v0.1.1-blue)
![Downloads](https://img.shields.io/badge/downloads-0k-green)
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

## Installation

In order to set an API key go to `Administration -> Modules -> Installed -> Rest API` on your Humhub account.
