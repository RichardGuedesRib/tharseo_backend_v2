az login
az aks install-cli
az aks get-credentials --resource-group tharseo-infra --name tharseo-cluster
kubectl get nodes
az account show
conectar ao lens

kubectl create namespace argocd
choco install kubernetes-helm
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm install argocd argo/argo-cd -n argocd

kubectl -n argocd delete secret argocd-secret

kubectl -n argocd create secret generic argocd-secret `
   --from-literal=admin.password='$2a$12$Pno6TzNldQxQXp1fji4theXeGoh6al3lDTNKOJR.NWRn2BWFHmzSG' `
   --from-literal=admin.passwordMtime="2025-05-05T23:55:00Z"

kubectl -n argocd create secret generic argocd-secret `
   --from-literal=admin.password='$2a$12$Pno6TzNldQxQXp1fji4theXeGoh6al3lDTNKOJR.NWRn2BWFHmzSG' `
   --from-literal=admin.passwordMtime="2025-05-05T23:55:00Z" `
   --dry-run=client -o yaml | kubectl apply -f -


kubectl -n argocd exec -it argocd-server-79b96f9f4f-kgqrh -- /bin/sh
ssh-keygen -t rsa -b 4096 -C "richard.silva46fatec@gmail.com" -f /tmp/argocd_rsa 
cat /tmp/argocd_rsa.pub
adicionar o git
ssh-agent -s
eval $(ssh-agent -s)
ssh-add /tmp/argocd_rsa
ssh -T git@github.com

baixar argo https://github.com/argoproj/argo-cd/releases/latest
logar: argocd login localhost:56551 --username admin --password admin
argocd repo add git@github.com:richardguedesrib/tharseo_backend_v2.git --ssh-private-key-path "C:\Users\richa\.ssh\id_rsa_pessoal"

para as variaveis do 
instalar kubeseal no windows e depois no kube
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml

Get-Content 'C:\Users\richa\Downloads\temp\secret.yaml' | kubeseal --controller-namespace kube-system --controller-name sealed-secrets-controller --format yaml > 'C:\Users\richa\Downloads\temp\sealed-secret.yaml'

