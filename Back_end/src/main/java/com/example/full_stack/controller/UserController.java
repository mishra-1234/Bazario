package com.example.full_stack.controller;

import com.example.full_stack.dto.LoginRequest;
import com.example.full_stack.dto.LoginResponse;
import com.example.full_stack.entity.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.full_stack.entity.User;
import com.example.full_stack.service.UserService;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }



    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody LoginRequest request) {

        LoginResponse response = userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );

        if (response.getUser() == null) {
            return ResponseEntity.status(401).body(response);
        }

        return ResponseEntity.ok(response);
    }


    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }


    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }


   /* @GetMapping("/logout}")
    public void logoutUser(){

    }*/



    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {

        User existingUser = userService.getUserById(id);

        if (existingUser == null) {
            return null;
        }

        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPassword(user.getPassword());
        existingUser.setRole(user.getRole());

        return userService.saveUser(existingUser);
    }





}
