// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RoleRegistry {
    mapping(address => string) private userRoles;
    
    event RoleRegistered(address indexed user, string role);

    function registerRole(string memory role) public {
        require(bytes(role).length > 0, "Role cannot be empty");
        userRoles[msg.sender] = role;
        emit RoleRegistered(msg.sender, role);
    }

    function getUserRole(address user) public view returns (string memory) {
        return userRoles[user];
    }
}
