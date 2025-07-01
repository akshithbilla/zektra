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
  Tab
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
    )
  },
  {
    id: "id-sync",
    label: "ID Sync",
    description: "Digital identity documents and credentials",
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    )
  },
  {
    id: "info-vault",
    label: "Info Vault",
    description: "Encrypted notes and sensitive text",
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: "identity-capsule",
    label: "Identity Capsule",
    description: "Complete digital profile information",
    icon: (
      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: "key-locker",
    label: "Key Locker",
    description: "Passwords and login credentials",
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    id: "docsafe",
    label: "DocSafe",
    description: "Private documents and files",
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
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

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ;

    if (!token) {
      console.warn("No token found in localStorage.");
      setUser(null);
      return false;
    }

    try {
      console.log("Checking auth with token:", token);

      const response = await axios.get(`${BACKEND_URL}/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.authenticated) {
        console.log("User authenticated:", response.data.user);
        setUser(response.data.user);
        return true;
      } else {
        console.warn("Auth check failed: Not authenticated.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.pathname]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setUploadError(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (e.g., 50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadError("File size exceeds 50MB limit");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // Set default item name to filename without extension
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
  
  // Validate inputs
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
      // For text content, create a text file
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
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const data = await response.json();
    
    // Reset form on success
    if (activeTab === "file") {
      setFile(null);
      setFileName("");
    } else {
      setTextContent("");
    }
    setItemName("");
    setTags("");
    
    alert("Item stored securely in your vault!");
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className={title({ size: "lg", class: "mb-2" })}>
            <span className={title({ color: "violet", size: "lg" })}>Encrypt</span> & Store
          </h1>
          <p className="text-default-500">
            Secure your sensitive data with military-grade encryption
          </p>
        </div>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <h2 className="text-xl font-semibold">New Secure Item</h2>
            <p className="text-sm text-default-500">
              Select a storage type and provide your data to encrypt
            </p>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit} id="encrypt-form">
              <div className="mb-6">
                <Select
                  label="Storage Type"
                  placeholder="Select a storage type"
                  className="w-full"
                  value={selectedType}
                  onChange={handleTypeChange}
                  required
                >
                  {storageTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} startContent={type.icon}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {selectedType && (
                <>
                  <Divider className="my-4" />
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      {selectedTypeData.icon}
                      <div>
                        <h3 className="font-semibold">{selectedTypeData.label}</h3>
                        <p className="text-sm text-default-500">{selectedTypeData.description}</p>
                      </div>
                    </div>
                  </div>

                  <Tabs 
                    selectedKey={activeTab}
                    onSelectionChange={(key) => {
                      setActiveTab(key);
                      setUploadError(null);
                    }}
                    className="mb-4"
                  >
                    <Tab key="text" title="Text Content">
                      <Textarea
                        label="Enter sensitive text to encrypt"
                        placeholder="Paste or type your confidential information here..."
                        className="w-full mt-4"
                        minRows={6}
                        value={textContent}
                        onChange={handleTextChange}
                      />
                    </Tab>
                    <Tab key="file" title="File Upload">
                      <div className="mt-4">
                        <Input
                          type="file"
                          label="Select file to encrypt"
                          className="w-full"
                          onChange={handleFileChange}
                        />
                        {fileName && (
                          <Chip color="success" variant="flat" className="mt-2">
                            Selected: {fileName} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </Chip>
                        )}
                      </div>
                    </Tab>
                  </Tabs>

                  <div className="mt-6">
                    <Input
                      type="text"
                      label="Item Name"
                      placeholder="Give this item a descriptive name"
                      className="w-full"
                      value={itemName}
                      onChange={handleItemNameChange}
                      required
                    />
                  </div>

                  <div className="mt-6">
                    <Input
                      type="text"
                      label="Tags (optional)"
                      placeholder="Add tags separated by commas"
                      className="w-full"
                      value={tags}
                      onChange={handleTagsChange}
                    />
                  </div>

                  {uploadError && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {uploadError}
                    </div>
                  )}
                </>
              )}
            </form>
          </CardBody>

          <CardFooter className="flex flex-col gap-4">
            {isEncrypting ? (
              <div className="w-full">
                <Progress
                  size="sm"
                  value={encryptionProgress}
                  color="secondary"
                  className="mb-2"
                />
                <p className="text-sm text-default-500 text-center">
                  Encrypting {encryptionProgress}% complete...
                </p>
              </div>
            ) : (
              <Button
                color="primary"
                size="lg"
                radius="full"
                className="w-full"
                type="submit"
                form="encrypt-form"
                isDisabled={!selectedType || isEncrypting}
              >
                Encrypt & Store Securely
              </Button>
            )}

            <div className="text-center">
              <p className="text-xs text-default-400">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                All data is encrypted with AES-256 before storage
              </p>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Card className="bg-purple-500/10 dark:bg-purple-400/10">
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Zero-Knowledge Encryption</h3>
                  <p className="text-sm text-default-500">Only you can access your data</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-blue-500/10 dark:bg-blue-400/10">
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">End-to-End Secure</h3>
                  <p className="text-sm text-default-500">Protected from upload to storage</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}