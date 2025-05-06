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

