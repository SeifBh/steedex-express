<?php

namespace AdminBundle\Controller;

use Symfony\Component\HttpFoundation\Response;
use UserBundle\Entity\User ;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use UserBundle\Repository\UserRepository;
use UserBundle\UserBundle;

class DefaultController extends Controller
{

    public function templateAction()
    {
        $user = $this->getUser();
        $userId = $user->getId();

        $em=$this->getDoctrine()->getManager();
        $nb_users = $em->getRepository("UserBundle:User")->countAllUsers();
        $em=$this->getDoctrine()->getManager();

        if ($this->isGranted("ROLE_ADMIN")){
            $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemande();
            $listeR = $em->getRepository("ReclamationBundle:Reclamation")->dixDernierReclamation();
        }
        else{

            $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemandeUser($userId);
           $listeR = $em->getRepository("ReclamationBundle:Reclamation")->dixDernierReclamationUser($userId);
            }

        return $this->render('@Admin/Default/dahboard.html.twig', array("nb_users"=>$nb_users,'listedemandes'=>$listeD,"listeRec" =>$listeR));
    }



    public function indexAction()
    {
        return $this->render('./default/test.html.twig', []);
    }
    public function adminAction()
    {
        $em=$this->getDoctrine()->getManager();
        $listeD = $em->getRepository("DemandeBundle:Demande")->dixDernierDemande();


        // replace this example code with whatever you need
        return $this->render('@Admin/Default/admin.html.twig',array('listedemandes'=>$listeD));
    }

    public function valideAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_demande_valide = $em->getRepository("DemandeBundle:Demande")->valide();
        return new Response($nb_demande_valide);
    }

    public function enCoursAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_demande_enCours = $em->getRepository("DemandeBundle:Demande")->enCours();
        return new Response($nb_demande_enCours);
    }

    public function enTraitementAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_demande_enTraitement = $em->getRepository("DemandeBundle:Demande")->enTraitement();
        return new Response($nb_demande_enTraitement);
    }
}
