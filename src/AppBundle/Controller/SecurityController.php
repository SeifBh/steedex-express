<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class SecurityController extends Controller
{

    /**
     * @Route("/json_login", name="json_login")
     * @return Response
     */
    public function login()
    {
        try {


            $user = $this->getUser();

            return $this->json([
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'email' => $user->getEmail(),
                'adresse' => $user->getAddresse(),
                'frais' => $user->getFraiLiv(),
                'tel' => $user->getTel(),
                'roles' => $user->getRoles(),
                'fiscal' => $user->getIdFiscale(),
            ]);



        } catch (\Exception $exception) {

            return new JsonResponse([
                'success' => false,
                'code'    => $exception->getCode(),
                'message' => $exception->getMessage(),
            ]);

        }
    }



}
