// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lock {
    struct LockInfo {
        uint256 amount;
        uint256 lockEndTime;
        bool isLocked;
    }

    mapping(address => LockInfo) public locks;
    
    event Locked(address indexed user, uint256 amount, uint256 lockEndTime);
    event Unlocked(address indexed user, uint256 amount);

    event Withdrawal(uint256 amount, uint256 when);

    uint256 public unlockTime;
    address payable public owner;

    constructor(uint256 _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function lock(uint256 _duration) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(!locks[msg.sender].isLocked, "Already locked");

        uint256 lockEndTime = block.timestamp + _duration;
        locks[msg.sender] = LockInfo({
            amount: msg.value,
            lockEndTime: lockEndTime,
            isLocked: true
        });

        emit Locked(msg.sender, msg.value, lockEndTime);
    }

    function unlock() external {
        LockInfo storage lockInfo = locks[msg.sender];
        require(lockInfo.isLocked, "No lock found");
        require(block.timestamp >= lockInfo.lockEndTime, "Lock period not ended");

        uint256 amount = lockInfo.amount;
        lockInfo.amount = 0;
        lockInfo.isLocked = false;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Unlocked(msg.sender, amount);
    }

    function getLockInfo(address _user) external view returns (uint256 amount, uint256 lockEndTime, bool isLocked) {
        LockInfo storage lockInfo = locks[_user];
        return (lockInfo.amount, lockInfo.lockEndTime, lockInfo.isLocked);
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
} 