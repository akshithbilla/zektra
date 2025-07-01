import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Avatar,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import ModalBodyWithReactPDF from "./ModalBodyWithReactPDF"

const categoryIcons = {
  "payment-wallet": (
    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "id-sync": (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  "info-vault": (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "key-locker": (
    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  "docsafe": (
    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

const categoryLabels = {
  "payment-wallet": "Payment Wallet",
  "id-sync": "ID Sync",
  "info-vault": "Info Vault",
  "key-locker": "Key Locker",
  "docsafe": "DocSafe"
};

export default function MyVaultPage() {
  const [activeCategory, setActiveCategory] = useState("payment-wallet");
  const [searchQuery, setSearchQuery] = useState("");
  const [vaultData, setVaultData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/files`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const initialData = Object.keys(categoryLabels).reduce((acc, category) => {
          acc[category] = [];
          return acc;
        }, {});
        const mergedData = {
          ...initialData,
          ...response.data.data
        };
        setVaultData(mergedData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load vault data");
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaultData();
  }, [navigate]);

  const filteredItems = vaultData[activeCategory]?.filter(item =>
    item?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    item?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery.toLowerCase()))
    || []
  );

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/files/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download file");
    }
  };
const isAndroid = /Android/i.test(navigator.userAgent);
const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(previewContent)}`;

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setVaultData(prev => ({
        ...prev,
        [activeCategory]: prev[activeCategory].filter(file => file._id !== fileId)
      }));
      if (previewFile?._id === fileId) {
        closePreview();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete file");
    }
  };

  const handlePreviewFile = async (file) => {
    setIsPreviewLoading(true);
    setPreviewFile(file);
    setPreviewContent(null);
    onOpen();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/files/preview/${file._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const { url, type } = response.data;
      let contentUrl = url;
      if (type.startsWith("image/")) {
        setPreviewContent(contentUrl); // image src
      } else if (type === "application/pdf" || type.includes("pdf")) {
        setPreviewContent(contentUrl); // for iframe
      } else if (type.startsWith("text/")) {
        // fetch text and show as <pre>
        const text = await fetch(contentUrl).then(res => res.text());
        setPreviewContent(text);
      } else {
        setPreviewContent(null); // Not previewable
      }
    } catch (error) {
      setPreviewContent(null);
      setError({
        message: 'Failed to preview file',
        details: error.message
      });
    }
    setIsPreviewLoading(false);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewContent(null);
    setIsPreviewLoading(false);
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardBody className="text-center">
              <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium mt-4">Error loading vault</h3>
              <p className="text-default-500 mt-2">{ error.message || error }</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardBody>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <section className="mb-8">
          <h1 className={title({ size: "lg" })}>
            My <span className={title({ color: "violet", size: "lg" })}>Vault</span>
          </h1>
          <p className={subtitle({ class: "mt-2" })}>
            All your secured items in one place, protected with military-grade encryption
          </p>
        </section>

        {/* Search and Filter Bar */}
        <section className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search your vault..."
            startContent={
              <svg className="w-5 h-5 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" endContent={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              }>
                Sort By: Recent
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="recent">Recent</DropdownItem>
              <DropdownItem key="name">Name</DropdownItem>
              <DropdownItem key="type">Type</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </section>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories Sidebar */}
          <div className="lg:w-1/4">
            <Card className="h-full">
              <CardHeader>
                <h2 className="text-lg font-semibold">Categories</h2>
              </CardHeader>
              <CardBody className="p-0">
                <div className="space-y-1">
                  {Object.keys(categoryLabels).map((categoryKey) => (
                    <button
                      key={categoryKey}
                      onClick={() => setActiveCategory(categoryKey)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 ${activeCategory === categoryKey 
                        ? "bg-purple-500/10 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400" 
                        : "hover:bg-default-100 dark:hover:bg-default-800"}`}
                    >
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20">
                        {categoryIcons[categoryKey]}
                      </div>
                      <span>{categoryLabels[categoryKey]}</span>
                      <Chip size="sm" className="ml-auto">
                        {vaultData[categoryKey]?.length || 0}
                      </Chip>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Items Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20">
                  {categoryIcons[activeCategory]}
                </div>
                {categoryLabels[activeCategory]}
              </h3>
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card 
                    key={item._id} 
                    isPressable 
                    isHoverable 
                    className="hover:shadow-lg transition-all"
                    onClick={() => handlePreviewFile(item)}
                  >
                    <CardHeader className="flex items-start gap-3">
                      <Avatar
                        isBordered
                        radius="sm"
                        color={
                          activeCategory === "payment-wallet" ? "secondary" :
                          activeCategory === "id-sync" ? "primary" :
                          activeCategory === "info-vault" ? "success" :
                          activeCategory === "key-locker" ? "warning" : "danger"
                        }
                        name={item.name.charAt(0)}
                      />
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-default-500">{item.type || item.contentType}</p>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0 px-4">
                      <div className="text-sm space-y-1">
                        {item.size && <p>Size: {formatFileSize(item.size)}</p>}
                        {item.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map(tag => (
                              <Chip key={tag} size="sm" variant="flat">{tag}</Chip>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardBody>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-xs text-default-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="light"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(item._id, item.name);
                          }}
                        >
                          Download
                        </Button>
<Button 
  size="sm" 
  color="danger" 
  variant="light"
  onClick={(e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      handleDeleteFile(item._id);
    }
  }}
>
  Delete
</Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardBody className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-medium mt-4">No items found</h4>
                  <p className="text-default-500 mt-1">
                    {searchQuery ? "Try a different search term" : `No items in ${categoryLabels[activeCategory]}`}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {/* Security Assurance */}
        <section className="mt-12 grid sm:grid-cols-2 gap-4">
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
        </section>
      </div>

      {/* File Preview Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {previewFile?.name}
                <p className="text-sm font-normal text-default-500">
                  {previewFile?.type || previewFile?.contentType}
                </p>
              </ModalHeader>

<ModalBodyWithReactPDF
  isPreviewLoading={isPreviewLoading}
  previewContent={previewContent}
  previewFile={previewFile}
/>

              <ModalFooter>
                <Button 
                  size="sm" 
                  variant="light"
                  onPress={() => handleDownloadFile(previewFile._id, previewFile.name)}
                  isDisabled={!previewFile}
                >
                  Download
                </Button>
<Button 
  size="sm" 
  color="danger" 
  variant="light"
  onPress={() => {
    if (confirm(`Are you sure you want to delete ${previewFile.name}?`)) {
      handleDeleteFile(previewFile._id);
      onClose();
    }
  }}
  isDisabled={!previewFile}
>
  Delete
</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}