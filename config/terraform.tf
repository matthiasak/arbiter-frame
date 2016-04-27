# tell AWS to run this on the app server after deployment
resource "aws_instance" "app" {
  provisioner "remote-exec" {
    connection {
      user = "ubuntu"
      host = "${self.public_ip}"
    }

    inline = [
        "cd /srv/otto-app",
        "sudo run npm postinstall",
        "cd ..",
        "sudo service nginx stop",
        "rm -rf letsencrypt",
        "git clone https://github.com/letsencrypt/letsencrypt",
        "sudo ./letsencrypt/letsencrypt-auto certonly --text --domain MYWEBSITEDOMAIN --agree-tos --keep-until-expiring --renew-by-default --email MYEMAIL &",
        "while ! pidof nginx >> /dev/null; do sleep 2; done;",
        "sudo kill $(cat /run/nginx.pid)",
        "wait",
        "sudo chown -R otto-app:otto-app /etc/letsencrypt",
        "sudo service nginx start"
    ]
  }
}