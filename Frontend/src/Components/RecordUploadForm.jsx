import { useState } from 'react';

const RecordUploadForm = ({ onUpload }) => {
  const [record, setRecord] = useState({
    title: '',
    file: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpload(record);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Record Title</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={record.title}
          onChange={(e) => setRecord({...record, title: e.target.value})}
        />
      </div>
      <div>
        <label className="block mb-2">File</label>
        <input
          type="file"
          className="w-full p-2 border rounded"
          onChange={(e) => setRecord({...record, file: e.target.files[0]})}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>
    </form>
  );
};

export default RecordUploadForm;
