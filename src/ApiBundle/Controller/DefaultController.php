<?php

namespace ApiBundle\Controller;

use DemandeBundle\Entity\Demande;
use DemandeBundle\Enum\DemandeEtatEnum;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class DefaultController extends Controller
{
    public function indexAction()
    {
        $em=$this->getDoctrine()->getManager();
        $users=$em->getRepository("UserBundle:User")->findAll();

        $view = $this->view($users,200);
        return $this->handleView($view);
    }

    public function getDemandesAction()
    {
        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findBy(array(), array('updated_date' => 'DESC'));
        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }

    public function getDemandeClientAction($id_client)
    {
        $demande = new Demande();

        $selectedUser = $this->getDoctrine()->getRepository("UserBundle:User")->findBy(['id'=>$id_client]);
        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findBy(array('id_client' => $selectedUser), array('updated_date' => 'DESC'));



        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }


    public function getDemandeLivreurAction($id_livreur)
    {
        $demande = new Demande();


        $selectedUser = $this->getDoctrine()->getRepository("UserBundle:User")->findBy(['id'=>$id_livreur]);

        $articles = $this->getDoctrine()->getRepository('DemandeBundle:Demande')->findBy(array('id_livreur' => $selectedUser), array('updated_date' => 'DESC'));


        $data = $this->get('jms_serializer')->serialize($articles, 'json');

        $response = new Response($data);
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }


    public function updateDemandeAction($id,$etat)
    {
        $demande = new Demande();



        $selectedDemande = $this->getDoctrine()->getRepository("DemandeBundle:Demande")->findOneBy(['id'=>$id]);
        if ($etat == "EnCours")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_EnCours);
        else if ($etat == "EnTraitement")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_EnTraitement);
        else if ($etat == "Valide")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_Valide);
        else if ($etat == "Cloture")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_Cloture);
        else if ($etat == "Retour")
            $selectedDemande->setEtat(DemandeEtatEnum::ETAT_Retour);



        $selectedDemande->setUpdatedDate(new \DateTime());
        $this->getDoctrine()->getManager()->persist($selectedDemande);
        $this->getDoctrine()->getManager()->flush();


        $response = new JsonResponse("updated");


        return $response;
    }



}
