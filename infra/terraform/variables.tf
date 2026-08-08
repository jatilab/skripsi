variable "oci_tenancy_ocid" {
  description = "OCID of the tenancy"
  type        = string
  sensitive   = true
}

variable "oci_user_ocid" {
  description = "OCID of the IAM user"
  type        = string
  sensitive   = true
}

variable "oci_fingerprint" {
  description = "Fingerprint of the API key"
  type        = string
  sensitive   = true
}

variable "oci_private_key" {
  description = "Contents of the OCI API private key (full PEM content)"
  type        = string
  sensitive   = true
}

variable "oci_region" {
  description = "OCI region"
  type        = string
  default     = "ap-batam-1"
}

variable "oci_compartment_ocid" {
  description = "OCID of the compartment"
  type        = string
  sensitive   = true
}

variable "oci_availability_domain" {
  description = "Availability domain (leave empty for AD-1)"
  type        = string
  default     = ""
}

variable "oci_instance_shape" {
  description = "Instance shape"
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "oci_instance_ocpus" {
  description = "Number of OCPUs"
  type        = number
  default     = 1
}

variable "oci_instance_memory_in_gbs" {
  description = "Memory in GBs"
  type        = number
  default     = 6
}

variable "oci_boot_volume_size_in_gbs" {
  description = "Boot volume size in GBs (free tier max 200GB)"
  type        = number
  default     = 100
}

variable "oci_ssh_public_key" {
  description = "SSH public key for instance access"
  type        = string
}

variable "gh_org_name" {
  description = "GitHub organization or user for Actions runner registration"
  type        = string
}

variable "gh_runner_name" {
  description = "GitHub Actions runner name"
  type        = string
  default     = "skripsi-server"
}

variable "gh_pat" {
  description = "GitHub PAT with admin:org scope (fetch runner registration token at runtime)"
  type        = string
  sensitive   = true
}

variable "gh_runner_version" {
  description = "GitHub Actions runner version"
  type        = string
  default     = "v2.335.1"
}

variable "gh_runner_os" {
  description = "GitHub Actions runner OS"
  type        = string
  default     = "linux"
}

variable "gh_runner_arch" {
  description = "GitHub Actions runner architecture"
  type        = string
  default     = "arm64"
}

variable "gh_runner_sha256" {
  description = "SHA256 checksum of GitHub Actions runner tarball"
  type        = string
  sensitive   = true
}
