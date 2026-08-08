#cloud-config
ssh_pwauth: false
disable_root: true

write_files:
  - path: /etc/ssh/sshd_config.d/99-hardening.conf
    permissions: "0644"
    owner: root:root
    content: |
      PermitRootLogin no
      PasswordAuthentication no
      KbdInteractiveAuthentication no
      ChallengeResponseAuthentication no
      PubkeyAuthentication yes
      X11Forwarding no

  - path: /etc/docker/daemon.json
    permissions: "0644"
    owner: root:root
    content: |
      {
        "log-driver": "json-file",
        "log-opts": {
          "max-size": "10m",
          "max-file": "3"
        }
      }

runcmd:
  # SSH hardening
  - systemctl restart ssh

  # Docker
  - curl -fsSL https://get.docker.com | sh
  - usermod -aG docker ubuntu
  - systemctl enable docker
  - systemctl start docker
  - docker swarm init

  # GitHub Actions runner
  - useradd --system --create-home --home-dir /home/actions-runner --shell /usr/sbin/nologin actions-runner
  - usermod -aG docker actions-runner

  - curl -fsSLo /tmp/actions-runner.tar.gz https://github.com/actions/runner/releases/download/${gh_runner_version}/actions-runner-${gh_runner_os}-${gh_runner_arch}-${gh_runner_version_number}.tar.gz
  - echo "${gh_runner_sha256}  /tmp/actions-runner.tar.gz" | sha256sum -c -

  - mkdir -p /opt/actions-runner
  - tar xzf /tmp/actions-runner.tar.gz -C /opt/actions-runner
  - rm -f /tmp/actions-runner.tar.gz

  - chown -R actions-runner:actions-runner /opt/actions-runner
  - |
    RUNNER_TOKEN=$(curl -fsSL -X POST \
      -H "Authorization: Bearer ${gh_pat}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/orgs/${gh_org_name}/actions/runners/registration-token" \
      | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
    [ -n "$RUNNER_TOKEN" ] || { echo "ERROR: failed to fetch runner token"; exit 1; }
    sudo -u actions-runner bash -c "cd /opt/actions-runner && ./config.sh --unattended --url https://github.com/${gh_org_name} --token \"$RUNNER_TOKEN\" --labels self-hosted,linux,arm64 --name \"${gh_runner_name}\" --work _work --replace --disableupdate"
  - cd /opt/actions-runner && ./svc.sh install actions-runner && ./svc.sh start

  - echo 'skripsi deployment server ready (Docker + GH Actions runner).' >> /etc/motd
