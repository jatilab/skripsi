data "oci_identity_availability_domains" "ads" {
  compartment_id = var.oci_compartment_ocid
}

locals {
  ad_name                  = var.oci_availability_domain != "" ? var.oci_availability_domain : data.oci_identity_availability_domains.ads.availability_domains[0].name
  gh_runner_version_number = replace(var.gh_runner_version, "v", "")
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.oci_compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = var.oci_instance_shape
  state                    = "AVAILABLE"

  filter {
    name   = "display_name"
    values = ["^.*-aarch64-.*$"]
    regex  = true
  }

  sort_by    = "TIMECREATED"
  sort_order = "DESC"
}

resource "oci_core_vcn" "skripsi" {
  compartment_id = var.oci_compartment_ocid
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "skripsi-vcn"
}

resource "oci_core_internet_gateway" "skripsi" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.skripsi.id
  display_name   = "skripsi-igw"
  enabled        = true
}

resource "oci_core_route_table" "skripsi" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.skripsi.id
  display_name   = "skripsi-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.skripsi.id
  }
}

resource "oci_core_security_list" "skripsi" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.skripsi.id
  display_name   = "skripsi-sl"

  ingress_security_rules {
    protocol = 6
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    protocol = 6
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = 6
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}

resource "oci_core_subnet" "skripsi" {
  compartment_id    = var.oci_compartment_ocid
  vcn_id            = oci_core_vcn.skripsi.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "skripsi-subnet"
  route_table_id    = oci_core_route_table.skripsi.id
  security_list_ids = [oci_core_security_list.skripsi.id]
}

resource "oci_core_instance" "skripsi" {
  compartment_id      = var.oci_compartment_ocid
  availability_domain = local.ad_name
  display_name        = "skripsi-server"
  shape               = var.oci_instance_shape

  shape_config {
    ocpus         = var.oci_instance_ocpus
    memory_in_gbs = var.oci_instance_memory_in_gbs
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu.images[0].id
    boot_volume_size_in_gbs = var.oci_boot_volume_size_in_gbs
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.skripsi.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.oci_ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init.yaml.tpl", {
      gh_org_name              = var.gh_org_name
      gh_runner_name           = var.gh_runner_name
      gh_pat                   = var.gh_pat
      gh_runner_version        = var.gh_runner_version
      gh_runner_version_number = local.gh_runner_version_number
      gh_runner_os             = var.gh_runner_os
      gh_runner_arch           = var.gh_runner_arch
      gh_runner_sha256         = var.gh_runner_sha256
    }))
  }

  agent_config {
    is_monitoring_disabled = true
  }

  lifecycle {
    ignore_changes = [source_details]
  }
}
