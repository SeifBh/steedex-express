<?php

namespace AdminBundle\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Attribute\AttributeBag;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\NativeSessionStorage;
use UserBundle\Entity\User ;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use UserBundle\Repository\UserRepository;
use UserBundle\UserBundle;

class DefaultController extends Controller
{

    public function templateAction()
    {

        $user = $this->getUser();
      //  $jwtManager = $this->container->get('lexik_jwt_authentication.jwt_manager');

        $userId = $user->getId();

       // $this->get('session')->set('loginUserId', $this->getUser());


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
        return new Response("sdfsd");
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

    public function frontAction()
    {


        // replace this example code with whatever you need
        return $this->render('@Admin/Default/front.html.twig');
    }

}
