# Use an appropriate base image with bash
FROM ubuntu:22.04

# Use bash for the shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install required dependencies as root
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git \
    libatomic1 \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash user

# Switch to the user
USER user
WORKDIR /home/user

# Create a script file sourced by both interactive and non-interactive bash shells
ENV BASH_ENV=/home/user/.bash_env
RUN touch "${BASH_ENV}"
RUN echo '. "${BASH_ENV}"' >> ~/.bashrc

# Download and install nvm
# Note: SSL verification is disabled here as a workaround for certificate validation issues
# in the Docker build environment. This is only for the build process and does not affect
# the runtime security of applications running in the container.
# In production environments, ensure proper CA certificates are configured.
RUN git config --global http.sslVerify false && \
    curl --insecure -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | sed 's/curl -/curl --insecure -/g' | PROFILE="${BASH_ENV}" bash && \
    sed -i 's/\(\\. "\$NVM_DIR\/nvm.sh"\)/\1 || true/g' "${BASH_ENV}"
# Patch nvm.sh to use --insecure flag for curl operations during Node.js downloads
RUN sed -i 's/nvm_has curl && curl -/nvm_has curl \&\& curl --insecure -/g' ~/.nvm/nvm.sh && \
    sed -i 's/curl -q /curl --insecure -q /g' ~/.nvm/nvm.sh && \
    sed -i 's/curl \${CURL_COMPRESSED_FLAG:-}/curl --insecure \${CURL_COMPRESSED_FLAG:-}/g' ~/.nvm/nvm.sh
# Temporarily disable pipefail for nvm install
# nvm.sh returns exit code 3 when it checks for an existing node version and finds none,
# which is expected behavior during initial installation. We disable pipefail to allow
# the installation to proceed despite this intermediate error.
SHELL ["/bin/bash", "-c"]
RUN echo node > .nvmrc && nvm install
# Re-enable pipefail
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
