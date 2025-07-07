import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
  Divider,
  Chip,
  Progress,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

const storageTypes = [
  {
    id: "payment-wallet",
    label: "Payment Wallet",
    description: "Secure financial information storage",
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "purple"
  },
  {
    id: "id-sync",
    label: "ID Sync",
    description: "Digital identity documents and credentials",
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
    color: "blue"
  },
  {
    id: "info-vault",
    label: "Info Vault",
    description: "Encrypted notes and sensitive text",
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "green"
  },
  {
    id: "identity-capsule",
    label: "Identity Capsule",
    description: "Complete digital profile information",
    icon: (
      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "pink"
  },
  {
    id: "key-locker",
    label: "Key Locker",
    description: "Passwords and login credentials",
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "yellow"
  },
  {
    id: "docsafe",
    label: "DocSafe",
    description: "Private documents and files",
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "red"
  }
];

export default function EncryptPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedType, setSelectedType] = useState("");
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [itemName, setItemName] = useState("");
  const [tags, setTags] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const {isOpen, onOpen, onClose} = useDisclosure();

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    if (!token) {
      console.warn("No token found in localStorage.");
      setUser(null);
      return false;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.authenticated) {
        setUser(response.data.user);
        return true;
      } else {
        localStorage.removeItem("token");
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error("Auth check error:", err?.response?.data || err.message);
      localStorage.removeItem("token");
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        navigate('/login');
      }
      setIsLoading(false);
    };
    init();
  }, [navigate, location.pathname]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setUploadError(null);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadError("File size exceeds 50MB limit");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setItemName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleTextChange = (e) => {
    setTextContent(e.target.value);
  };

  const handleItemNameChange = (e) => {
    setItemName(e.target.value);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const simulateEncryptionProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setEncryptionProgress(progress);
    }, 300);
    return interval;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    
    if (!selectedType) {
      setUploadError("Please select a storage type");
      return;
    }
    
    if (activeTab === "file" && !file) {
      setUploadError("Please select a file to upload");
      return;
    }
    
    if (activeTab === "text" && !textContent.trim()) {
      setUploadError("Please enter text content");
      return;
    }
    
    if (!itemName.trim()) {
      setUploadError("Please enter an item name");
      return;
    }

    setIsEncrypting(true);
    const progressInterval = simulateEncryptionProgress();

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      if (activeTab === "file" && file) {
        formData.append('file', file);
      } else if (activeTab === "text") {
        const textBlob = new Blob([textContent], { type: 'text/plain' });
        formData.append('file', textBlob, `${itemName}.txt`);
      }
      
      formData.append('storageType', selectedType);
      formData.append('itemName', itemName);
      formData.append('tags', tags);
      formData.append('contentType', activeTab);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      
      if (activeTab === "file") {
        setFile(null);
        setFileName("");
      } else {
        setTextContent("");
      }
      setItemName("");
      setTags("");
      
      // Set success message and open modal
      const typeName = storageTypes.find(t => t.id === selectedType)?.label || "item";
      setSuccessMessage(`Your ${typeName} has been securely encrypted and stored!`);
      onOpen();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setEncryptionProgress(0);
      setIsEncrypting(false);
    }
  };

  const selectedTypeData = storageTypes.find(type => type.id === selectedType);

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600 dark:text-gray-400">Loading secure vault...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h1 className={`text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent`}>
            Secure Data Encryption
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Protect your sensitive information with military-grade encryption before storage
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Storage types */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Storage Types
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {storageTypes.map((type) => (
                  <div 
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedType === type.id 
                      ? `bg-${type.color}-100 dark:bg-${type.color}-900/30 border-l-4 border-${type.color}-500` 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/20`}>
                        {type.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{type.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h2 className="text-xl font-semibold">New Secure Item</h2>
                  {selectedTypeData && (
                    <Badge color={selectedTypeData.color} variant="flat" className="w-fit">
                      {selectedTypeData.label}
                    </Badge>
                  )}
                </div>
                {selectedTypeData && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedTypeData.description}
                  </p>
                )}
              </CardHeader>

              <CardBody>
                {selectedType ? (
                  <form onSubmit={handleSubmit} id="encrypt-form" className="space-y-6">
                    <Tabs 
                      selectedKey={activeTab}
                      onSelectionChange={(key) => {
                        setActiveTab(key);
                        setUploadError(null);
                      }}
                      variant="underlined"
                      className="mb-2"
                    >
                      <Tab 
                        key="text" 
                        title={
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="truncate">Text Content</span>
                          </div>
                        }
                      >
                        <div className="mt-6">
                          <Textarea
                            label="Sensitive Text to Encrypt"
                            placeholder="Paste or type your confidential information here..."
                            className="w-full"
                            minRows={8}
                            value={textContent}
                            onChange={handleTextChange}
                            description="This content will be encrypted before storage"
                          />
                        </div>
                      </Tab>
                      <Tab 
                        key="file" 
                        title={
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="truncate">File Upload</span>
                          </div>
                        }
                      >
                        <div 
                          className={`mt-6 border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"}`}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <svg className={`w-12 h-12 mx-auto ${isDragging ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {isDragging ? "Drop your file here" : "Drag & drop your file here or click to browse"}
                            </p>
                            <input 
                              type="file" 
                              id="file-upload"
                              className="hidden" 
                              onChange={handleFileChange}
                            />
                            <Button 
                              as="label"
                              htmlFor="file-upload"
                              variant="bordered"
                              size="sm"
                              className="mt-2"
                            >
                              Select File
                            </Button>
                          </div>
                        </div>
                        {fileName && (
                          <div className="mt-4 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar 
                                src={URL.createObjectURL(file)} 
                                name={fileName}
                                className="w-10 h-10 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{fileName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="light" 
                              color="danger"
                              onClick={() => {
                                setFile(null);
                                setFileName("");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </Tab>
                    </Tabs>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Input
                          type="text"
                          label="Item Name"
                          placeholder="e.g. 'Bank Credentials' or 'Passport Copy'"
                          className="w-full"
                          value={itemName}
                          onChange={handleItemNameChange}
                          required
                          description="Give this item a descriptive name for easy identification"
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          label="Tags (optional)"
                          placeholder="finance, personal, work"
                          className="w-full"
                          value={tags}
                          onChange={handleTagsChange}
                          description="Separate tags with commas for better organization"
                        />
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium">Upload Error</p>
                          <p className="text-sm">{uploadError}</p>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      Select a Storage Type
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Choose from the available storage types on the left to begin securing your data
                    </p>
                  </div>
                )}
              </CardBody>

              {selectedType && (
                <CardFooter className="border-t border-gray-200 dark:border-gray-700">
                  <div className="w-full space-y-4">
                    {isEncrypting ? (
                      <div className="space-y-3">
                        <Progress
                          size="sm"
                          value={encryptionProgress}
                          color="primary"
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Encrypting {encryptionProgress}%</span>
                          <span className="flex items-center gap-1">
                            <Spinner size="sm" />
                            Processing...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          color="primary"
                          size="lg"
                          className="w-full"
                          type="submit"
                          form="encrypt-form"
                          isDisabled={!selectedType || isEncrypting}
                          startContent={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          }
                        >
                          Encrypt & Store Securely
                        </Button>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          All data is encrypted with AES-256 before storage
                        </div>
                      </>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>

            {/* Security features cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardBody className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Zero-Knowledge Encryption</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Only you hold the keys to decrypt your data</p>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardBody className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">End-to-End Secure</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protected from upload through to storage</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Encryption Successful</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <p>{successMessage}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Your data is now securely stored in your vault with military-grade encryption.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Continue
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}