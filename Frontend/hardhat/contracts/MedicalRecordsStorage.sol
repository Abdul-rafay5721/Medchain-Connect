// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalRecordsStorage {
    struct Record {
        string title;
        string date;
        string recordType;
        string description;
        string ipfsUrl;
        address uploader;
    }

    Record[] private records;

    event RecordUploaded(
        uint indexed recordId,
        address indexed uploader,
        string title,
        string ipfsUrl
    );

    function uploadRecord(
        string memory _title,
        string memory _date,
        string memory _recordType,
        string memory _description,
        string memory _ipfsUrl
    ) public {
        records.push(Record({
            title: _title,
            date: _date,
            recordType: _recordType,
            description: _description,
            ipfsUrl: _ipfsUrl,
            uploader: msg.sender
        }));
        emit RecordUploaded(records.length - 1, msg.sender, _title, _ipfsUrl);
    }

    function getRecord(uint _index) public view returns (
        string memory title,
        string memory date,
        string memory recordType,
        string memory description,
        string memory ipfsUrl,
        address uploader
    ) {
        require(_index < records.length, "Invalid index");
        Record storage rec = records[_index];
        return (
            rec.title,
            rec.date,
            rec.recordType,
            rec.description,
            rec.ipfsUrl,
            rec.uploader
        );
    }

    function getRecordsCount() public view returns (uint) {
        return records.length;
    }

    function getRecordsByUploader(address _uploader) public view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < records.length; i++) {
            if (records[i].uploader == _uploader) {
                count++;
            }
        }
        uint[] memory result = new uint[](count);
        uint idx = 0;
        for (uint i = 0; i < records.length; i++) {
            if (records[i].uploader == _uploader) {
                result[idx] = i;
                idx++;
            }
        }
        return result;
    }
}
