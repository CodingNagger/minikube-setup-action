const core = require('@actions/core');

function compareVersions(left, right) {
    var l = left.split('.').map((num) => parseInt(num));
    var r = right.split('.').map((num) => parseInt(num));

    if (l[0] > r[0]) {
        return 1;
    } else if (l[0] === r[0]) {
        if (l[1] > r[1]) {
            return 1;
        } else if (l[1] === r[1]) {
            if (l[2] > r[2]) {
                return 1;
            } else if (l[2] === r[2]) {
                return 0;
            }
        }
    }

    return -1;
}

try {
    const minikubeVersion = core.getInput('minikube-version');
    const minikubePlatform = core.getInput('minikube-platform');
    const kubernetesVersion = core.getInput('k8s-version');

    const minikubeFullVersion = compareVersions('1.7.0', minikubeVersion) === -1 ? `${minikubeVersion}-0_${minikubePlatform}` : minikubeVersion;

    const { spawnSync } = require('child_process');

    console.log(`Downloading Minikube ${minikubeFullVersion}...`);
    var lastCommandRunning = spawnSync('curl', ['-LO', `https://github.com/kubernetes/minikube/releases/download/v${minikubeVersion}/minikube_${minikubeFullVersion}.deb`]);
    console.log(`${lastCommandRunning.stdout.toString()}`);
    console.error(`${lastCommandRunning.stderr.toString()}`);

    console.log(`Installing Minikube...`);
    lastCommandRunning = spawnSync('sudo', ['dpkg', '-i', `minikube_${minikubeFullVersion}.deb`]);
    console.log(`${lastCommandRunning.stdout.toString()}`);
    console.error(`${lastCommandRunning.stderr.toString()}`);

    console.log(`Creating Minikube launch command...`);

    const launcher = ['CHANGE_MINIKUBE_NONE_USER=true', 'sudo', '-E', 'minikube', 'start', '--vm-driver=none', '--kubernetes-version', `v${kubernetesVersion}`, '--extra-config', 'kubeadm.ignore-preflight-errors=SystemVerification'].join(' ');

    core.setOutput('launcher', launcher);

    console.log(`Ready to launch minikube!!!`);
} catch (error) {
    if (!!lastCommandRunning) {
        console.log(`${lastCommandRunning.stdout.toString()}`);
        console.error(`${lastCommandRunning.stderr.toString()}`);
    }
    core.setFailed(error.message);
}

