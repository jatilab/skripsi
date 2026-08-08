output "instance_public_ip" {
  description = "Public IP of the compute instance"
  value       = oci_core_instance.skripsi.public_ip
}

output "instance_private_ip" {
  description = "Private IP of the compute instance"
  value       = oci_core_instance.skripsi.private_ip
}
