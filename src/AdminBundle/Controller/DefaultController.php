<?php

namespace AdminBundle\Controller;

use UserBundle\Entity\User ;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use UserBundle\Repository\UserRepository;
use UserBundle\UserBundle;

class DefaultController extends Controller
{
    public function templateAction()
    {
        $em=$this->getDoctrine()->getManager();
        $nb_users = $em->getRepository(UserRepository::class,new User())->findAll();
        return $this->render('::Template.html.twig', array("nb"=>$nb_users));
    }

    public function indexAction()
    {
        return $this->render('./default/test.html.twig', []);
    }
    public function adminAction()
    {

        // replace this example code with whatever you need
        return $this->render('@Admin/Default/admin.html.twig', []);
    }





}
