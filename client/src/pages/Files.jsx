import { useState, useEffect } from 'react';
import { Upload, FileText, Download, ThumbsUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Files() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const FileCard = ({ file, onUpvote }) => {
    const [upvoteCount, setUpvoteCount] = useState(file.upvoteCount);
    const [hasUpvoted, setHasUpvoted] = useState(file.upvotes?.includes(user?.id));

    const handleUpvote = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/files/${file._id}/upvote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.id })
        });

        if (!response.ok) throw new Error('Failed to upvote');
        const data = await response.json();
        
        setUpvoteCount(data.upvoteCount);
        setHasUpvoted(data.hasUpvoted);
        
        // Fetch updated stats after upvoting
        const statsResponse = await fetch(`http://localhost:5000/api/users/${user.id}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          // Use a custom event to update stats across components
          window.dispatchEvent(new CustomEvent('userStatsUpdate', { detail: statsData }));
        }
      } catch (error) {
        console.error('Error upvoting:', error);
      }
    };

    return (
      <Card key={file._id} className="bg-white/70">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-medium">{file.originalName}</h3>
              <p className="text-sm text-gray-500">
                Uploaded by {file.uploadedBy?.firstName} {file.uploadedBy?.lastName} on{' '}
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  variant={hasUpvoted ? "default" : "outline"} 
                  size="sm"
                  onClick={handleUpvote}
                >
                  <ThumbsUp className={`w-4 h-4 mr-1 ${hasUpvoted ? 'text-white' : ''}`} />
                  {upvoteCount}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={`http://localhost:5000/uploads/${file.filename}`}
              download
              className="inline-flex items-center"
            >
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="page-container">
  <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Study Materials</h1>
        <Button onClick={handleUploadClick}>
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <FileCard key={file._id} file={file} />
        ))}
      </div>
    </div>
  );
} 